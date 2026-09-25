# Moonlight Freight theme

The supplied Moonlight Freight logo is preserved in `public/images/moonlight-freight-logo.jpg`.
The header, footer and workspace use a shared Brand component. The globe is framed using CSS;
the original image file is unchanged. The homepage displays the complete logo and tagline.

- Navy `#383772`: primary brand color, navigation, standard buttons and dark sections.
- Teal `#117b8e`: links, supporting headlines, icons and input focus.
- Yellow `#FFDA16`: highlighted shipping actions and small brand accents, paired with dark text.
- White and cool neutral surfaces: cards, forms and page backgrounds.
- Plus Jakarta Sans for headings; Inter for body text and controls.

Shared styles and palette tokens live in `src/app/globals.css` and `tailwind.config.js`.
Keep yellow for accents, maintain visible keyboard focus, and preserve the logo's proportions.
