/**
 * Blog Page
 * 
 * Lists all blog posts from markdown files in the content directory
 */

import { Link, useLoaderData } from "react-router";
import AuthButton from "../../components/auth/AuthButton";
import LiveStreamBanner from "../../components/LiveStreamBanner";
import { getAllBlogPosts, formatDate, type BlogPost } from "../../lib/blog";
import '../global.css';

export async function loader() {
  return getAllBlogPosts();
}

export default function BlogPage() {
  const blogPosts = useLoaderData() as BlogPost[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      {/* YouTube Live Stream Banner */}
      <LiveStreamBanner />
      
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/ambient mix.png" 
            alt="pailiaq ambient mix artwork"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]"></div>
        </div>
        
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
        
        <div className="relative z-10 px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <a href="/" className="hover:scale-105 transition-transform duration-300">
                <img 
                  src="/pailiaq-logo-small.png" 
                  alt="pailiaq logo"
                  className="w-32 h-32 rounded-full shadow-2xl border-4 border-white/20 cursor-pointer"
                />
              </a>
            </div>
            
            <h1 className="text-6xl font-bold text-white mb-4 tracking-wider">
              paili<span className="inline-block scale-x-[-1] -ml-0.5 mr-0.5">a</span>q
            </h1>
            
            <p className="text-2xl text-white/80 mb-8 font-light">
              Electronic Music • Sound Design • Education
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm">
                Ambient
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm">
                Experimental
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm">
                Electronica
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Blog Content Section - Starts immediately after header */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Blog
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Insights, tutorials, and thoughts on music theory, technology, and the intersection of creativity and education.
            </p>
          </div>

          {/* Blog Posts */}
          {blogPosts.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                No Blog Posts Yet
              </h3>
              <p className="text-white/70 text-lg mb-8">
                Blog posts will appear here once they're added to the content directory.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {blogPosts.map((post) => (
                <article key={post.slug} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white/60 text-sm">{formatDate(post.date)}</div>
                    <div className="text-white/50 text-sm">
                      {post.readingTime} min read
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {post.title}
                  </h3>
                  
                  <p className="text-white/70 mb-6 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}