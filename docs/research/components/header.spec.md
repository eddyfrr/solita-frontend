# Header Specification

## Overview
- **Target file:** `src/components/Header.tsx`
- **Interaction model:** Static, mobile menu toggle (click-driven)

## Structure
Desktop (top to bottom):
- Row 1: Nav links left-aligned: Home, Shop, About, Contact, Tutorials, Influencers
  - Logo centered: `/images/logo-main@2x.png` (dark version for white bg)
  - Right icons: Search, User/Account, Cart with badge
- No announcement bar in original

Mobile:
- Hamburger icon left
- Logo centered: `/images/logo-main@2x.png`
- Cart icon right

## Computed Styles
### Header container
- backgroundColor: #ffffff
- borderBottom: 1px solid rgba(0,0,0,0.05)
- padding: 0
- height: auto

### Nav links (desktop)
- fontFamily: Jost
- fontSize: 13px
- fontWeight: 400
- color: #282828
- textTransform: uppercase
- letterSpacing: 0.1em
- gap between links: ~30px
- padding: 15px 0

### Logo
- height: ~50px
- width: auto

### Icon buttons
- color: #282828
- size: 20px

## Text Content
Nav items: Home, Shop, About, Contact, Tutorials, Influencers

## Assets
- Logo: `/images/logo-main@2x.png`

## Responsive Behavior
- Desktop: Full nav bar with links, logo center, icons right
- Mobile (<768px): Hamburger left, logo center, cart right. Nav hidden.
