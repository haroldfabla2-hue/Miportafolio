import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contentApi, type CmsContent } from '../services/api';

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<CmsContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchPost() {
            if (!slug) return;
            try {
                setLoading(true);
                const data = await contentApi.getContentBySlug(slug);
                if (data) {
                    setPost(data);
                } else {
                    setNotFound(true);
                }
            } catch (err) {
                console.error('Blog post fetch error:', err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <section style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '120px var(--spacing-lg) var(--spacing-xl)',
                minHeight: '80vh'
            }}>
                <div style={{ height: '40px', width: '60%', backgroundColor: '#1a1a1a', borderRadius: '8px', marginBottom: '1rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: '20px', width: '30%', backgroundColor: '#1a1a1a', borderRadius: '8px', marginBottom: '3rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ height: '16px', width: `${90 - i * 5}%`, backgroundColor: '#1a1a1a', borderRadius: '4px', marginBottom: '0.8rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
            </section>
        );
    }

    if (notFound || !post) {
        return (
            <section style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '120px var(--spacing-lg) var(--spacing-xl)',
                minHeight: '80vh',
                textAlign: 'center'
            }}>
                <p style={{ fontSize: '6rem', marginBottom: '1rem' }}>404</p>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Post Not Found</h2>
                <p style={{ color: '#888', marginBottom: '2rem' }}>The article you're looking for doesn't exist or has been moved.</p>
                <Link to="/blog" style={{
                    color: 'var(--color-accent)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem'
                }}>
                    ← Back to Blog
                </Link>
            </section>
        );
    }

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '120px var(--spacing-lg) var(--spacing-xl)',
                minHeight: '80vh'
            }}
        >
            {/* Back link */}
            <Link to="/blog" style={{
                color: '#666',
                textDecoration: 'none',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '2rem'
            }}>
                ← Back to Blog
            </Link>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {post.tags.map(tag => (
                        <span key={tag} style={{
                            padding: '0.2rem 0.8rem',
                            fontSize: '0.8rem',
                            borderRadius: '20px',
                            border: '1px solid #333',
                            color: '#888'
                        }}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Title */}
            <h1 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: '1rem',
                letterSpacing: '-0.02em'
            }}>
                {post.title}
            </h1>

            {/* Date */}
            <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '3rem' }}>
                {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    })
                    : 'Draft'}
            </p>

            {/* Cover Image */}
            {post.coverImage && (
                <div style={{
                    width: '100%',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginBottom: '3rem',
                    border: '1px solid #222'
                }}>
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                </div>
            )}

            {/* Content */}
            <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                    color: '#ccc',
                }}
            />

            {/* Share / CTA */}
            <div style={{
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: '1px solid #222',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Link to="/blog" style={{
                    color: 'var(--color-accent)',
                    textDecoration: 'none',
                    fontWeight: 600
                }}>
                    ← More Articles
                </Link>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied!');
                    }}
                    style={{
                        padding: '0.6rem 1.5rem',
                        backgroundColor: 'transparent',
                        border: '1px solid #333',
                        borderRadius: '30px',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#888'; }}
                >
                    Share ↗
                </button>
            </div>
        </motion.article>
    );
};

export default BlogPost;
