import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isPublished: boolean;
  userId: string;
  metaTitle?: string;
  metaDescription?: string;
}

interface Block {
  id: string;
  type: string;
  position: number;
  config: Record<string, any>;
}

interface Props {
  params: { slug: string };
}

async function getPageData(slug: string): Promise<{ page: PageData; blocks: Block[] } | null> {
  try {
    // In a real implementation, this would fetch from your API
    // For now, return mock data based on the slug
    if (slug === 'jessica') {
      return {
        page: {
          id: 'page-1',
          title: 'Jessica Creator',
          slug: 'jessica',
          description: 'Content Creator & Entrepreneur. Welcome to my little corner of the internet!',
          isPublished: true,
          userId: 'user-1',
          metaTitle: 'Jessica Creator - Links & Content',
          metaDescription: 'Find all my latest content, projects, and ways to connect with me.',
        },
        blocks: [
          {
            id: 'blk-1',
            type: 'links_block',
            position: 1,
            config: {
              links: [
                { label: 'My Latest Blog Posts', url: 'https://jessica.blog' },
                { label: 'Online Shop', url: 'https://shop.jessica' },
                { label: 'Spotify Playlist', url: 'https://spotify.example' },
              ],
            },
          },
          {
            id: 'blk-2',
            type: 'social_block',
            position: 2,
            config: {
              socials: [
                { provider: 'instagram', url: 'https://instagram.com/jessica' },
                { provider: 'youtube', url: 'https://youtube.com/jessica' },
              ],
            },
          },
          {
            id: 'blk-3',
            type: 'contact_block',
            position: 3,
            config: {
              phone: '+628123456789',
              whatsapp_prefilled: 'Halo, saya mau pesan',
            },
          },
        ],
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getPageData(params.slug);
  
  if (!data || !data.page.isPublished) {
    return {
      title: 'Page Not Found',
    };
  }

  const { page } = data;
  
  return {
    title: page.metaTitle || `${page.title} - Linkhub Pro`,
    description: page.metaDescription || page.description || `Check out ${page.title}'s links and content`,
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.description || `Check out ${page.title}'s links and content`,
      type: 'profile',
      url: `https://linkhub.pro/p/${page.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.description || `Check out ${page.title}'s links and content`,
    },
  };
}

function BlockRenderer({ block }: { block: Block }) {
  const handleClick = async (url: string, label?: string) => {
    // Track click event
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'click',
          pageId: 'page-1', // In real implementation, get from page data
          blockId: block.id,
          metadata: { url, label },
        }),
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
    
    // Open URL
    window.open(url, '_blank');
  };

  switch (block.type) {
    case 'links_block':
      return (
        <div className="space-y-4">
          {(block.config.links || []).map((link: any, index: number) => (
            <button
              key={index}
              onClick={() => handleClick(link.url, link.label)}
              className="w-full bg-primary text-primary-foreground p-4 rounded-xl text-center hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
              data-testid={`link-${index}`}
            >
              <div className="flex items-center justify-center space-x-3">
                <span className="text-xl">📚</span>
                <span className="font-medium">{link.label}</span>
              </div>
            </button>
          ))}
        </div>
      );

    case 'social_block':
      return (
        <div className="flex space-x-4">
          {(block.config.socials || []).map((social: any, index: number) => (
            <button
              key={index}
              onClick={() => handleClick(social.url, social.provider)}
              className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 text-white p-4 rounded-xl text-center hover:opacity-90 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
              data-testid={`social-${index}`}
            >
              <div className="text-xl mb-1">
                {social.provider === 'instagram' ? '📸' : '🎥'}
              </div>
              <div className="text-sm font-medium capitalize">{social.provider}</div>
            </button>
          ))}
        </div>
      );

    case 'contact_block':
      const whatsappUrl = `https://wa.me/${block.config.phone?.replace(/[^\d]/g, '')}?text=${encodeURIComponent(block.config.whatsapp_prefilled || 'Hello!')}`;
      return (
        <button
          onClick={() => handleClick(whatsappUrl, 'WhatsApp')}
          className="w-full bg-green-600 text-white p-4 rounded-xl text-center hover:bg-green-700 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
          data-testid="contact-whatsapp"
        >
          <div className="flex items-center justify-center space-x-3">
            <span className="text-xl">💬</span>
            <span className="font-medium">WhatsApp Me</span>
          </div>
        </button>
      );

    case 'link':
      return (
        <button
          onClick={() => handleClick(block.config.url, block.config.label)}
          className="w-full bg-accent text-accent-foreground p-4 rounded-xl text-center hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
          data-testid="single-link"
        >
          {block.config.label}
        </button>
      );

    case 'button':
      return (
        <button
          onClick={() => handleClick(block.config.url, block.config.label)}
          className="w-full bg-secondary text-secondary-foreground p-4 rounded-xl text-center hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
          data-testid="button-block"
        >
          {block.config.label}
        </button>
      );

    case 'text':
      return (
        <div className="p-4 text-center text-foreground" data-testid="text-block">
          {block.config.content}
        </div>
      );

    default:
      return (
        <div className="bg-muted text-muted-foreground p-4 rounded-xl text-center">
          {block.type} block
        </div>
      );
  }
}

export default async function PublicPage({ params }: Props) {
  const data = await getPageData(params.slug);

  if (!data || !data.page.isPublished) {
    notFound();
  }

  const { page, blocks } = data;

  return (
    <>
      {/* Analytics tracking script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Track page view
            fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'view',
                pageId: '${page.id}',
                metadata: { 
                  userAgent: navigator.userAgent,
                  referrer: document.referrer 
                }
              })
            }).catch(console.error);
          `,
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-border">
            {/* Profile Header */}
            <div className="text-center mb-8">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full p-1">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {page.title.charAt(0)}
                    </div>
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2" data-testid="page-title">
                {page.title}
              </h1>
              {page.description && (
                <p className="text-muted-foreground" data-testid="page-description">
                  {page.description}
                </p>
              )}
            </div>

            {/* Blocks */}
            <div className="space-y-6" data-testid="blocks-container">
              {blocks
                .sort((a, b) => a.position - b.position)
                .map((block) => (
                  <div key={block.id} data-testid={`block-${block.type}`}>
                    <BlockRenderer block={block} />
                  </div>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center pt-8 border-t border-border mt-8">
              <p className="text-xs text-muted-foreground">
                Made with <span className="text-red-500">♥</span> using{' '}
                <a 
                  href="https://linkhub.pro" 
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Linkhub Pro
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
