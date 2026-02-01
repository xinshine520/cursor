# News Capability Specification

## Purpose
新闻功能提供企业新闻动态展示能力，允许用户浏览新闻列表和查看新闻详情。该功能包括新闻列表页面、新闻详情页面，以及导航菜单集成，使用 Mock API 提供数据支持。
## Requirements
### Requirement: News List Display
The system SHALL provide a news list page that displays a collection of news articles in a card-based layout.

#### Scenario: User views news list
- **WHEN** user navigates to `/news`
- **THEN** the system displays a list of news articles
- **AND** each article shows: title, summary/excerpt, publish date, and optional thumbnail image
- **AND** articles are displayed in reverse chronological order (newest first)
- **AND** the page includes a loading state while fetching data
- **AND** the page handles errors gracefully with an error message

#### Scenario: News list empty state
- **WHEN** no news articles are available
- **THEN** the system displays an appropriate empty state message

### Requirement: News Detail Display
The system SHALL provide a news detail page that displays the full content of a single news article.

#### Scenario: User views news detail
- **WHEN** user clicks on a news article from the list
- **THEN** the system navigates to `/news/:id`
- **AND** displays the full article content including: title, publish date, author (if available), and full text content
- **AND** provides a way to navigate back to the news list
- **AND** the page includes a loading state while fetching data
- **AND** the page handles errors gracefully (e.g., article not found)

#### Scenario: News detail not found
- **WHEN** user navigates to `/news/:id` with an invalid or non-existent ID
- **THEN** the system displays an appropriate "not found" message
- **AND** provides a link to return to the news list

### Requirement: News Navigation Integration
The system SHALL integrate news access into the main navigation menu.

#### Scenario: User accesses news from navigation
- **WHEN** user clicks on "新闻" in the top navigation bar
- **THEN** the system navigates to `/news` (news list page)
- **AND** the navigation item is visually consistent with other menu items
- **AND** the navigation item shows active state when on news pages

### Requirement: News Data Structure
The system SHALL provide news data through Mock API with the following structure.

#### Scenario: News list API response
- **WHEN** frontend requests news list
- **THEN** the Mock API returns data in format: `{ code: 200, message: 'success', data: NewsItem[], traceId: string }`
- **AND** each `NewsItem` contains: `id`, `title`, `summary`, `publishDate`, `author` (optional), `thumbnail` (optional), `category` (optional)

#### Scenario: News detail API response
- **WHEN** frontend requests news detail by ID
- **THEN** the Mock API returns data in format: `{ code: 200, message: 'success', data: NewsDetail | null, traceId: string }`
- **AND** `NewsDetail` contains: `id`, `title`, `content` (full text), `publishDate`, `author` (optional), `thumbnail` (optional), `category` (optional)
- **AND** if news not found, returns `{ code: 404, message: '新闻未找到', data: null, traceId: string }`

### Requirement: News Styling Consistency
The system SHALL ensure news pages follow the project's design system and visual consistency.

#### Scenario: News page styling
- **WHEN** user views news pages
- **THEN** the pages use Tailwind CSS utility classes consistent with other pages
- **AND** news cards have hover effects matching other card components (shadow, translate-y)
- **AND** the layout is responsive and mobile-friendly
- **AND** typography follows the project's font and size conventions
- **AND** colors match the project's color scheme (deep-space, tech-blue, etc.)

