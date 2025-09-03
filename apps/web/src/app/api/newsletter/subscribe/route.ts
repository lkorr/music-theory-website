// Newsletter subscription API endpoint with Mailchimp integration

import mailchimp from '@mailchimp/mailchimp_marketing';

interface SubscriptionRequest {
  email: string;
  firstName?: string;
  lastName?: string;
}

// Initialize Mailchimp
const initializeMailchimp = () => {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || !serverPrefix) {
    throw new Error('Mailchimp API credentials not configured');
  }

  mailchimp.setConfig({
    apiKey,
    server: serverPrefix,
  });

  return mailchimp;
};

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as SubscriptionRequest;
    const { email, firstName, lastName } = body;

    // Validation
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ 
          error: 'Email address is required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ 
          error: 'Please enter a valid email address' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Initialize Mailchimp
    try {
      initializeMailchimp();
    } catch (error) {
      console.error('Mailchimp initialization error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Newsletter service temporarily unavailable. Please try again later.' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const listId = process.env.MAILCHIMP_LIST_ID;
    if (!listId) {
      return new Response(
        JSON.stringify({ 
          error: 'Newsletter service not properly configured' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Prepare member data for Mailchimp
    const memberData = {
      email_address: normalizedEmail,
      status: 'subscribed' as const, // Can be 'subscribed', 'unsubscribed', 'cleaned', 'pending'
      merge_fields: {
        ...(firstName && { FNAME: firstName.trim() }),
        ...(lastName && { LNAME: lastName.trim() })
      },
      tags: ['website_signup'] // Tag to identify source
      // Note: timestamp_signup removed as Mailchimp handles this automatically
    };

    try {
      // Add subscriber to Mailchimp list
      const response = await mailchimp.lists.addListMember(listId, memberData);

      console.log(`📧 New newsletter subscription via Mailchimp: ${normalizedEmail}`);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Successfully subscribed! Thank you for joining our newsletter.',
          email: normalizedEmail,
          mailchimp_id: response.id
        }),
        { 
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      );

    } catch (mailchimpError: any) {
      // Handle specific Mailchimp errors
      if (mailchimpError.status === 400) {
        const errorDetail = mailchimpError.response?.body?.detail || '';
        
        if (errorDetail.includes('already a list member')) {
          return new Response(
            JSON.stringify({ 
              message: 'You are already subscribed to our newsletter!',
              alreadySubscribed: true
            }),
            { 
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        
        if (errorDetail.includes('fake') || errorDetail.includes('invalid')) {
          return new Response(
            JSON.stringify({ 
              error: 'Please enter a valid email address' 
            }),
            { 
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }

      console.error('Mailchimp API error:', mailchimpError);
      
      return new Response(
        JSON.stringify({ 
          error: 'There was a problem subscribing you to our newsletter. Please try again later.' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error. Please try again later.' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Get subscription stats (admin endpoint)
export async function GET(): Promise<Response> {
  try {
    // Initialize Mailchimp
    try {
      initializeMailchimp();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Mailchimp service not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const listId = process.env.MAILCHIMP_LIST_ID;
    if (!listId) {
      return new Response(
        JSON.stringify({ error: 'List ID not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get list statistics from Mailchimp
    const listInfo = await mailchimp.lists.getList(listId);

    return new Response(
      JSON.stringify({ 
        success: true,
        listName: listInfo.name,
        totalSubscribers: listInfo.stats.member_count,
        totalUnsubscribed: listInfo.stats.unsubscribe_count,
        lastUpdated: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch newsletter statistics' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle unsupported methods
export async function PUT(): Promise<Response> {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: { 
        'Content-Type': 'application/json',
        'Allow': 'GET, POST'
      }
    }
  );
}

export const DELETE = PUT;
export const PATCH = PUT;