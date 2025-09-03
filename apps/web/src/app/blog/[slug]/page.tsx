/**
 * Individual Blog Post Page
 * 
 * Displays a single blog post from markdown file
 */

import { Link, useLoaderData, useParams } from "react-router";
import AuthButton from "../../../components/auth/AuthButton";
import LiveStreamBanner from "../../../components/LiveStreamBanner";
import { getBlogPost, getAllBlogPosts, formatDate, type BlogPost } from "../../../lib/blog";
import '../../global.css';

export async function loader({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post || !post.published) {
    throw new Response("Post not found", { status: 404 });
  }
  return post;
}

export default function BlogPostPage() {
  const post = useLoaderData() as BlogPost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      {/* YouTube Live Stream Banner */}
      <LiveStreamBanner />
      
      {/* Navigation Header */}
      <header className="relative py-6">
        <div className="absolute top-6 right-6 z-20 flex items-center gap-8">
          <nav className="flex items-center gap-1 bg-black/20 backdrop-blur-md rounded-lg px-1 py-1 border border-white/10">
            <Link 
              to="/about" 
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
            >
              About
            </Link>
            <span className="text-white/30">•</span>
            <Link 
              to="/blog" 
              className="text-white font-medium transition-colors px-4 py-2 rounded-md bg-blue-600/40"
            >
              Blog
            </Link>
            <span className="text-white/30">•</span>
            <Link 
              to="/store" 
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
            >
              Store
            </Link>
            <span className="text-white/30">•</span>
            <Link 
              to="/dashboard" 
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
            >
              Dashboard
            </Link>
            <span className="text-white/30">•</span>
            <Link 
              to="/contact" 
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
            >
              Contact
            </Link>
          </nav>
          <AuthButton showRegister={true} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Back to Blog Link */}
        <div className="mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>

        {/* Article */}
        <article className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 lg:p-12">
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-4 text-white/60 text-sm">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>•</span>
                <span>{post.readingTime} min read</span>
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-white/80 leading-relaxed mb-6">
                {post.excerpt}
              </p>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-white/60 bg-white/10 px-3 py-1 rounded-full border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div 
            className="prose prose-lg prose-invert max-w-none prose-headings:text-white prose-p:text-white/80 prose-p:leading-relaxed prose-li:text-white/80 prose-strong:text-white prose-code:text-blue-300 prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/20 prose-blockquote:text-white/70 prose-blockquote:border-l-blue-500"
            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
          />

        </article>

        {/* Related Articles or Newsletter Signup */}
        <div className="mt-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Stay Updated
          </h3>
          <p className="text-white/70 text-sm mb-4">
            Subscribe to our newsletter for more insights on music production, sound design, and electronic music.
          </p>
          <Link
            to="/#newsletter"
            className="inline-flex items-center px-6 py-3 bg-blue-600/80 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-300 border border-blue-500/50"
          >
            Subscribe to Newsletter
            <span className="ml-2">→</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}