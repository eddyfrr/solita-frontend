# Footer Specification

## Overview
- **Target file:** `src/components/Footer.tsx`
- **Interaction model:** Static

## DOM Structure
Desktop: 3-column layout on olive/gold background
- Column 1: Script logo image + About Us heading + description text + "FOLLOW US" + social icons
- Column 2: "Be The First To Know" heading + "Subscribe to our mailing list" + newsletter form (First Name input, Email input, Subscribe button)
- Bottom bar: Links (Contact Us, Terms and Conditions, Payment Method, Delivery Policy, Return Policy, Hair Care) + Copyright

Mobile: Single column, stacked

## Computed Styles
### Footer container
- backgroundColor: #b9a16b
- paddingTop: 60px
- paddingBottom: 0
- color: #ffffff

### Logo
- Image: `/images/logo-light@2x.png` (white/light version)
- height: ~80px
- marginBottom: 20px

### About Us heading
- fontSize: 16px
- fontWeight: 700
- textTransform: uppercase
- letterSpacing: 0.1em
- color: #ffffff
- marginBottom: 16px

### Description text
- fontSize: 14px
- fontWeight: 400
- lineHeight: 1.7
- color: #ffffff
- opacity: 0.9

### "FOLLOW US" heading
- fontSize: 14px
- fontWeight: 700
- textTransform: uppercase
- letterSpacing: 0.1em
- marginTop: 24px

### Social icons
- Custom images: fb-icon@2x.png, ig-icon@2x.png, pnt-icon@2x.png
- Size: ~35px each
- Display: flex row, gap 12px
- Filter: brightness to make them visible on gold bg

### Newsletter section
- "Be The First To Know" heading: fontSize 16px, fontWeight 700, uppercase
- "Subscribe to our mailing list" subtitle: fontSize 14px
- First Name input: border 1px solid white, bg transparent, color white, placeholder white/50
- Email input: same styling with mail icon
- Subscribe button: bg #282828, color white, width 100%, padding 12px, uppercase, letterSpacing 0.1em

### Bottom bar
- backgroundColor: #ffffff or slightly lighter
- padding: 20px 0
- Links: fontSize 13px, color #686868, separated by pipes or spacing
- Copyright: "Copyright 2021 © AYYA HAIR | Designed By AMANi Art"
- color for copyright: #686868

## Text Content (verbatim)
- About: "We are a luxury braiding hair brand with stores all over Nigeria, including Lagos, Abuja & Port Harcourt. We sell the highest quality braiding hair at the best prices. Shop online or visit us at our stores!"
- Newsletter heading: "Be The First To Know"
- Newsletter subtitle: "Subscribe to our mailing list"
- Copyright: "Copyright 2021 © AYYA HAIR | Designed By AMANi Art"
- Links: Contact Us, Terms and Conditions, Payment Method, Delivery Policy, Return Policy, Hair Care

## Assets
- Logo: `/images/logo-light@2x.png`
- Social icons: `/images/icons/fb-icon@2x.png`, `/images/icons/ig-icon@2x.png`, `/images/icons/pnt-icon@2x.png`

## Responsive
- Desktop: 2-3 column grid
- Mobile: Single column stacked, centered text
