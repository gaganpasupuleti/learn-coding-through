export type StudyMaterialContentType = 'book' | 'article' | 'audiobook'

export interface StudyMaterialSampleItem {
  id: string
  title: string
  content_type: StudyMaterialContentType
  author: string
  summary: string
  domains: string[]
  tags: string[]
  source_url: string
  license_status: string
  review_status: string
}

/** Static sample catalog for the Phase 26f functional test shell. Metadata only. */
export const STUDY_MATERIALS_SAMPLE: StudyMaterialSampleItem[] = [
  {
    id: 'book-1',
    title: 'The Elements of Style',
    content_type: 'book',
    author: 'William Strunk Jr.',
    summary: 'A classic guide to English writing style and usage.',
    domains: ['career'],
    tags: ['writing', 'style-guide'],
    source_url: 'https://www.gutenberg.org/ebooks/37134',
    license_status: 'public-domain',
    review_status: 'approved',
  },
  {
    id: 'book-2',
    title: 'Relativity: The Special and General Theory',
    content_type: 'book',
    author: 'Albert Einstein',
    summary: 'Einstein explains special and general relativity for general readers.',
    domains: ['engineering'],
    tags: ['physics', 'mathematics'],
    source_url: 'https://www.gutenberg.org/ebooks/5001',
    license_status: 'public-domain',
    review_status: 'pending_review',
  },
  {
    id: 'audio-1',
    title: 'Pride and Prejudice',
    content_type: 'audiobook',
    author: 'Jane Austen',
    summary: 'Sample audiobook metadata for a classic novel.',
    domains: ['career'],
    tags: ['audiobook', 'public-domain'],
    source_url: 'https://librivox.org/search?title=Pride+and+Prejudice',
    license_status: 'public-domain',
    review_status: 'approved',
  },
  {
    id: 'audio-2',
    title: 'The Time Machine',
    content_type: 'audiobook',
    author: 'H.G. Wells',
    summary: 'Sample audiobook metadata for a science-fiction classic.',
    domains: ['engineering'],
    tags: ['audiobook', 'science-fiction'],
    source_url: 'https://librivox.org/search?title=The+Time+Machine',
    license_status: 'public-domain',
    review_status: 'draft',
  },
  {
    id: 'art-1',
    title: 'Understanding List Comprehensions in Python',
    content_type: 'article',
    author: 'Sample Author A',
    summary: 'Short overview of list comprehensions with practical examples.',
    domains: ['python'],
    tags: ['python', 'no-full-text'],
    source_url: 'https://example-tech-blog.invalid/python-list-comprehensions',
    license_status: 'no-full-text',
    review_status: 'approved',
  },
  {
    id: 'art-2',
    title: 'SQL Window Functions Explained',
    content_type: 'article',
    author: 'Sample Author B',
    summary: 'Introduces ROW_NUMBER, RANK, and LAG with query examples.',
    domains: ['sql'],
    tags: ['sql', 'window-functions'],
    source_url: 'https://example-data-blog.invalid/sql-window-functions',
    license_status: 'no-full-text',
    review_status: 'pending_review',
  },
]
