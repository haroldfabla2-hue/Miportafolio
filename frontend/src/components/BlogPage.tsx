import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from './SEO';
import { contentApi, localizeCmsContent, type CmsContent } from '../services/api';

const POSTS_PER_PAGE = 6;
const FALLBACK_DATE_LOCALE = 'en-US';

const BlogPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [posts, setPosts] = useState<CmsContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
    const dateLocale = i18n.language.startsWith('es') ? 'es-ES' : FALLBACK_DATE_LOCALE;

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

    const localizedPosts = useMemo(
        () => posts.map((post) => localizeCmsContent(post, i18n.language)),
        [posts, i18n.language]
    );

    // Obtener todos los tags únicos
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        localizedPosts.forEach(post => {
            post.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [localizedPosts]);

    // Filtrar y ordenar posts
    const filteredPosts = useMemo(() => {
        let result = [...localizedPosts];
        
        // Filtro por búsqueda
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(post => 
                post.title?.toLowerCase().includes(query) ||
                post.metaDesc?.toLowerCase().includes(query) ||
                post.content?.toLowerCase().includes(query) ||
                post.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Filtro por tag
        if (selectedTag) {
            result = result.filter(post => 
                post.tags?.includes(selectedTag)
            );
        }

        // Ordenar
        result.sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
                return dateB - dateA;
            } else {
                return (a.title || '').localeCompare(b.title || '');
            }
        });

        return result;
    }, [localizedPosts, searchQuery, selectedTag, sortBy]);

    // Posts visibles (con paginación)
    const visiblePosts = filteredPosts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredPosts.length;

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + POSTS_PER_PAGE);
    };

    const handleReset = () => {
        setSearchQuery('');
        setSelectedTag('');
        setVisibleCount(POSTS_PER_PAGE);
    };

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
                {t('blog.title')}
            </motion.h1>
            
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ color: '#888', fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '600px' }}
            >
                {t('blog.subtitle')}
            </motion.p>

            {/* Filtros y Búsqueda */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid #222'
            }}>
                {/* Buscador */}
                <div style={{ flex: '1 1 250px', minWidth: '200px' }}>
                    <input
                        type="text"
                        placeholder={t('blog.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(POSTS_PER_PAGE); }}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Filtro por Tag */}
                <select
                    value={selectedTag}
                    onChange={(e) => { setSelectedTag(e.target.value); setVisibleCount(POSTS_PER_PAGE); }}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        minWidth: '150px'
                    }}
                >
                    <option value="">{t('blog.allTopics')}</option>
                    {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>

                {/* Ordenar */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        minWidth: '140px'
                    }}
                >
                    <option value="date">{t('blog.newest')}</option>
                    <option value="title">{t('blog.az')}</option>
                </select>

                {/* Reset button */}
                {(searchQuery || selectedTag) && (
                    <button
                        onClick={handleReset}
                        style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: '#ef4444',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        {t('blog.clear')}
                    </button>
                )}
            </div>

            {/* Contador de resultados */}
            <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {filteredPosts.length} {t('blog.postsFound')}
                {searchQuery && ` for "${searchQuery}"`}
                {selectedTag && ` in ${selectedTag}`}
            </div>

            {loading ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
            ) : filteredPosts.length === 0 ? (
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
                    <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {t('blog.noPostsFound')}
                    </h3>
                    <p style={{ color: '#666', fontSize: '1rem', marginBottom: '1rem' }}>
                        {t('blog.tryAdjusting')}
                    </p>
                    <button
                        onClick={handleReset}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#A3FF00',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#000',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        {t('blog.viewAllPosts')}
                    </button>
                </motion.div>
            ) : (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '2rem'
                    }}>
                        {visiblePosts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: Math.min(index * 0.05, 0.3) }}
                            >
                                <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <motion.article
                                        whileHover={{ y: -5 }}
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            borderRadius: '16px',
                                            overflow: 'hidden', flex: 1,
                                            border: '1px solid #222',
                                            minHeight: '420px',
                                            display: 'flex',
                                            flexDirection: 'column',
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
                                                overflow: 'hidden', flex: 1,
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
                                                    <span 
                                                        key={tag} 
                                                        onClick={(e) => { e.preventDefault(); setSelectedTag(tag); setVisibleCount(POSTS_PER_PAGE); }}
                                                        style={{
                                                            padding: '0.2rem 0.6rem',
                                                            fontSize: '0.75rem',
                                                            borderRadius: '20px',
                                                            border: '1px solid #333',
                                                            color: selectedTag === tag ? '#A3FF00' : '#888',
                                                            cursor: 'pointer',
                                                            backgroundColor: selectedTag === tag ? 'rgba(163,255,0,0.1)' : 'transparent'
                                                        }}
                                                    >
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
                                                overflow: 'hidden', flex: 1,
                                            }}>
                                                {post.metaDesc || post.content?.substring(0, 150)}
                                            </p>
                                            <div style={{
                                                marginTop: '1rem',
                                                fontSize: '0.8rem',
                                                color: '#555'
                                            }}>
                                                {post.publishedAt
                                                    ? new Date(post.publishedAt).toLocaleDateString(dateLocale, {
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

                    {/* Load More Button */}
                    {hasMore && (
                        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                            <button
                                onClick={handleLoadMore}
                                style={{
                                    padding: '1rem 3rem',
                                    backgroundColor: 'transparent',
                                    border: '2px solid #A3FF00',
                                    borderRadius: '30px',
                                    color: '#A3FF00',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#A3FF00';
                                    e.currentTarget.style.color = '#000';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#A3FF00';
                                }}
                            >
                                {t('blog.loadMore')} ({filteredPosts.length - visibleCount} {t('blog.more')})
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default BlogPage;
