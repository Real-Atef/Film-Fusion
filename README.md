# Film Fusion

A modern, feature-rich movie and TV series discovery platform built with vanilla HTML, CSS, and JavaScript.

## Features

### Browse & Discover

- **Homepage**: Dynamic slideshow, trending content, recommendations, popular movies/series, coming soon
- **Movies Page**: Browse all movies with advanced filtering and sorting
- **Series Page**: Browse all TV shows with advanced filtering and sorting
- **Trending Page**: View what's trending today or this week
- **Coming Soon Page**: Upcoming releases with month filter
- **Genre Pages**: Click any genre to browse all content of that type

### Advanced Filtering & Sorting

- Filter by **genre**, **year**, **rating** (5+ to 9+ stars), **language**
- Sort by popularity, rating, release date, or alphabetically
- Pagination with responsive card counts

### Content Details

- Movie poster and YouTube trailer embed
- Synopsis, genres (clickable), director/creator, release date, runtime
- **Box Office**: Budget, revenue, and profit (movies only)
- **Where to Watch**: Streaming platform availability
- **Top Cast**: With character names, links to actor pages
- **Videos Gallery**: Multiple trailers and clips
- **Images Gallery**: Backdrops and posters
- **Similar Content**: Recommendations based on current item
- **Share Buttons**: Twitter, Facebook, WhatsApp, copy link

### Actor/Director Pages

- Biography and filmography
- Paginated list of all works (sorted by release date)

### User Features

- **Watchlist**: Save movies/series to watch later
- **Watched Status**: Mark content as watched
- **View History**: Track recently viewed items (last 50)
- **User Authentication**: Register and sign in (client-side demo)

### Search

- Global search across movies and TV shows
- Live search with debouncing
- Results sorted by popularity

## Project Structure

```
Film-Fusion/
├── Home.html                 # Landing page
├── .gitignore               # Git ignore rules
├── README.md                # This file
├── CSS/
│   ├── common.css           # Design system & shared styles
│   ├── Home.css             # Homepage slideshow
│   ├── Description.css      # Detail page styles
│   ├── Movies-Series.css    # Listing pages (movies, series, trending, etc.)
│   ├── person.css           # Actor/director page
│   ├── watchlist.css        # Watchlist tabs
│   ├── About.css            # About page
│   ├── Sign-in.css          # Sign in form
│   └── Sign-up.css          # Sign up form
├── JS/
│   ├── config.js            # API config, utilities, shared functions
│   ├── Home.js              # Homepage logic
│   ├── MoviesAPI.js         # Movies page with filters
│   ├── Series.js            # Series page with filters
│   ├── Description.js       # Detail page (full features)
│   ├── genre.js             # Genre browsing
│   ├── person.js            # Actor/director page
│   ├── trending.js          # Trending page
│   ├── coming-soon.js       # Coming soon page
│   ├── search.js            # Search with live results
│   ├── watchlist.js         # Watchlist management
│   └── auth.js              # Authentication
├── Pages/
│   ├── movies.html          # Movies listing
│   ├── series.html          # Series listing
│   ├── Description.html     # Content details
│   ├── genre.html           # Genre results
│   ├── person.html          # Actor/director
│   ├── trending.html        # Trending content
│   ├── coming-soon.html     # Upcoming releases
│   ├── watchlist.html       # User lists (3 tabs)
│   ├── search-results.html  # Search results
│   ├── Sign-in.html         # Sign in
│   ├── Sign-up.html         # Sign up
│   └── About-us.html        # About page
└── Images/                  # Logos and icons
```

## Technical Features

### Performance

- **API Response Caching**: 5-minute sessionStorage cache
- **Debounced Events**: Resize and search input optimization
- **Lazy Loading**: Images load on demand
- **Skeleton Loaders**: Animated placeholders during loading

### Code Quality

- **Shared Utilities**: Centralized in `config.js`
- **Constants**: Configurable breakpoints, limits, durations
- **No Duplicate Code**: Single `getCardCount()` function for all pages
- **ARIA Labels**: Accessibility improvements on buttons

### Design System

- Dark theme with emerald accent (#10b981)
- 8px spacing grid
- Inter font family
- Custom scrollbar matching theme
- Smooth animations (150-350ms)
- Responsive breakpoints: 1400px, 1200px, 1024px, 768px, 480px

### Data Persistence (localStorage)

| Key            | Purpose                  |
| -------------- | ------------------------ |
| `ff_watchlist` | Items to watch           |
| `ff_watched`   | Completed items          |
| `ff_history`   | Recently viewed (50 max) |
| `ff_users`     | Registered accounts      |
| `ff_cache`     | API response cache       |

## API

Powered by [The Movie Database (TMDB)](https://www.themoviedb.org/documentation/api).

### Endpoints Used

- `/trending/all/{day|week}` - Trending content
- `/movie/popular`, `/tv/popular` - Popular content
- `/movie/upcoming` - Coming soon
- `/discover/movie`, `/discover/tv` - Filtered browsing
- `/{movie|tv}/{id}` - Details, credits, videos, images, providers
- `/person/{id}` - Actor details and filmography
- `/search/multi` - Global search
- `/genre/{movie|tv}/list` - Genre lists

## Getting Started

1. Clone or download the repository
2. Open `Home.html` in a web browser
3. Browse movies and series
4. Click cards to view details
5. Use the heart button (♡) to add to watchlist
6. Use the checkmark (○) to mark as watched
7. Access your lists via the Watchlist page

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License. Movie data provided by TMDB.

---

**Project**: Film Fusion - Movie & TV Discovery Platform
