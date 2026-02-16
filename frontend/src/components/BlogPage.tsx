import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import { contentApi, type CmsContent } from '../services/api';

const BlogPage: React.FC = () => {
    const [posts, setPosts] = useState<CmsContent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const data = await contentApi.getBlogPosts();
                setPosts(data);
            } catch (err) {
                console.warn('Blog fetch failed:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, []);

    return (
        <section style={{
            padding: 'var(--spacing-xl) 0',
            maxWidth: 'var(--spacing-container)',
            margin: '0 auto',
            paddingLeft: 'var(--spacing-lg)',
            paddingRight: 'var(--spacing-lg)',
            minHeight: '80vh',
            paddingTop: '120px'
        }}>
            <SEO title="Blog" description="Read our latest thoughts on design, development, and building meaningful digital experiences." />
            <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                    letterSpacing: '-0.02em'
                }}
            >
                Blog
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ color: '#888', fontSize: '1.2rem', marginBottom: '4rem', maxWidth: '600px' }}
            >
                Thoughts on design, development, and building digital experiences that matter.
            </motion.p>

            {loading ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '2rem'
                }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{
                            height: '350px',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '16px',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        textAlign: 'center',
                        padding: '6rem 2rem',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderRadius: '24px',
                        border: '1px solid #222'
                    }}
                >
                    <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>✍️</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Coming Soon
                    </h3>
                    <p style={{ color: '#666', fontSize: '1rem' }}>
                        New articles are on the way. Stay tuned.
                    </p>
                </motion.div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '2rem'
                }}>
                    {posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <motion.article
                                    whileHover={{ y: -5 }}
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: '1px solid #222',
                                        transition: 'border-color 0.3s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#444')}
                                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#222')}
                                >
                                    {post.coverImage && (
                                        <div style={{
                                            width: '100%',
                                            height: '200px',
                                            overflow: 'hidden'
                                        }}>
                                            <img
                                                src={post.coverImage}
                                                alt={post.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div style={{ padding: '1.5rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            gap: '0.5rem',
                                            flexWrap: 'wrap',
                                            marginBottom: '1rem'
                                        }}>
                                            {post.tags?.slice(0, 3).map(tag => (
                                                <span key={tag} style={{
                                                    padding: '0.2rem 0.6rem',
                                                    fontSize: '0.75rem',
                                                    borderRadius: '20px',
                                                    border: '1px solid #333',
                                                    color: '#888'
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <h3 style={{
                                            fontSize: '1.3rem',
                                            fontWeight: 700,
                                            marginBottom: '0.75rem',
                                            lineHeight: 1.3
                                        }}>
                                            {post.title}
                                        </h3>
                                        <p style={{
                                            color: '#888',
                                            fontSize: '0.9rem',
                                            lineHeight: 1.6,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {post.metaDesc || post.content.substring(0, 150)}
                                        </p>
                                        <div style={{
                                            marginTop: '1rem',
                                            fontSize: '0.8rem',
                                            color: '#555'
                                        }}>
                                            {post.publishedAt
                                                ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                })
                                                : 'Draft'}
                                        </div>
                                    </div>
                                </motion.article>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default BlogPage;
