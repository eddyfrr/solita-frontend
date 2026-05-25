# HeroSection Specification

## Overview
- **Target file:** `src/components/HeroSection.tsx`
- **Interaction model:** Static

## DOM Structure
- Full-width container with background image
- Centered text overlay with heading, subheading, CTA button

## Computed Styles
### Container
- width: 100%
- height: ~80vh
- position: relative
- overflow: hidden
- backgroundImage: url(/images/hero-banner.jpg)
- backgroundSize: cover
- backgroundPosition: center

### Overlay (if any)
- Light overlay for text readability

### Heading "AYYA"
- fontFamily: Jost
- fontSize: ~60px (desktop), ~36px (mobile)
- fontWeight: 400
- color: #ffffff
- textTransform: uppercase
- letterSpacing: 0.3em
- textAlign: center

### Subheading "LUXURY BRAIDING HAIR"
- fontSize: ~14px
- fontWeight: 400
- color: #ffffff
- textTransform: uppercase
- letterSpacing: 0.3em

### CTA Button "SHOP ALL"
- backgroundColor: transparent
- border: 1px solid #ffffff
- color: #ffffff
- padding: 12px 40px
- fontSize: 12px
- fontWeight: 400
- letterSpacing: 0.2em
- textTransform: uppercase
- hover: backgroundColor #ffffff, color #282828
- transition: all 0.3s ease

## Text Content
- Heading: "AYYA"
- Subheading: "LUXURY BRAIDING HAIR"
- CTA: "SHOP ALL"

## Assets
- Background: `/images/hero-banner.jpg`

## Responsive
- Desktop: Full viewport height, large heading
- Mobile: Slightly shorter, smaller text
