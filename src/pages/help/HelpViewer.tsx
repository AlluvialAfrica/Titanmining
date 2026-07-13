import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { HELP_ARTICLES, HelpArticle, HelpCategory } from '../../data/helpArticles';

interface HelpViewerProps {
  contextFilter?: string;
  onClose?: () => void;
}

const CATEGORIES: { key: HelpCategory; labelEN: string; labelFR: string }[] = [
  { key: 'getting_started', labelEN: 'Getting Started', labelFR: 'Pour commencer' },
  { key: 'role_guide', labelEN: 'Role Guides', labelFR: 'Guides des roles' },
  { key: 'kpi_definition', labelEN: 'KPI Definitions', labelFR: 'Definitions des KPI' },
  { key: 'reports', labelEN: 'Report Templates', labelFR: 'Modeles de rapports' },
  { key: 'troubleshooting', labelEN: 'Troubleshooting', labelFR: 'Depannage' },
];

export default function HelpViewer({ contextFilter, onClose }: HelpViewerProps) {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory>('getting_started');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isEN = language === 'en';

  const filteredArticles = useMemo(() => {
    let arts = HELP_ARTICLES.filter((a) => a.category === selectedCategory);

    if (contextFilter) {
      arts = arts.filter((a) => a.relatedPages.includes(contextFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      arts = arts.filter(
        (a) =>
          a.titleEN.toLowerCase().includes(q) ||
          a.titleFR.toLowerCase().includes(q) ||
          a.bodyEN.toLowerCase().includes(q) ||
          a.bodyFR.toLowerCase().includes(q)
      );
    }

    return arts.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [selectedCategory, contextFilter, searchQuery]);

  const renderArticleContent = (article: HelpArticle) => {
    const title = isEN ? article.titleEN : article.titleFR;
    const body = isEN ? article.bodyEN : article.bodyFR;
    const paragraphs = body.split('\n\n');

    return (
      <div>
        <button
          onClick={() => setSelectedArticle(null)}
          className="text-xs uppercase tracking-widest text-zinc-500 hover:text-black font-semibold mb-6 transition-all hover:pl-1"
        >
          &larr; {isEN ? 'Back to list' : 'Retour a la liste'}
        </button>

        <h2 className="text-2xl font-light font-serif italic mb-6 border-b border-black pb-4">
          {title}
        </h2>

        <div className="space-y-4">
          {paragraphs.map((p: string, i: number) => (
            <p key={i} className="text-sm leading-relaxed text-zinc-700">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-zinc-100">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">
            {isEN ? 'Related roles' : 'Roles associes'}: {article.relatedRoles.map(r => r.replace(/_/g, ' ')).join(', ')}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[60vh]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-light font-serif italic">
          {isEN ? 'Help Center' : 'Centre d\'aide'}
        </h1>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-widest text-zinc-500 hover:text-black font-semibold transition-colors"
          >
            {isEN ? 'Close' : 'Fermer'}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isEN ? 'Search help articles...' : 'Rechercher des articles d\'aide...'}
          className="w-full border-b border-black bg-transparent py-2 text-sm font-serif italic placeholder:text-zinc-400 focus:outline-none focus:border-b-2 transition-all"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Category Sidebar */}
        <aside className="md:w-56 flex flex-col gap-1">
          <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-3">
            {isEN ? 'Categories' : 'Categories'}
          </h3>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setSelectedCategory(cat.key);
                setSelectedArticle(null);
              }}
              className={`text-left py-2 border-b text-sm transition-all ${
                selectedCategory === cat.key
                  ? 'border-black text-black font-semibold pl-2'
                  : 'border-transparent text-zinc-500 hover:text-black hover:pl-2'
              }`}
            >
              {isEN ? cat.labelEN : cat.labelFR}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <section className="flex-1 border-l border-zinc-100 pl-8">
          {selectedArticle ? (
            renderArticleContent(selectedArticle)
          ) : (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-4">
                {isEN
                  ? CATEGORIES.find((c) => c.key === selectedCategory)?.labelEN
                  : CATEGORIES.find((c) => c.key === selectedCategory)?.labelFR}
                {' '}({filteredArticles.length})
              </h3>

              {filteredArticles.length === 0 ? (
                <div className="border border-black p-8 text-center text-zinc-500 font-serif italic">
                  {isEN ? 'No articles found.' : 'Aucun article trouve.'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredArticles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="w-full text-left py-3 border-b border-zinc-100 hover:border-black transition-all group"
                    >
                      <p className="text-sm font-semibold group-hover:pl-2 transition-all">
                        {isEN ? article.titleEN : article.titleFR}
                      </p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono mt-1">
                        {article.id}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
