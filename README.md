# Kafkaesque Blog

Kafkaesque Blog is a personal blog and project showcase. It features discussions on Kafka, Jewish life, cultural reflections, and showcases my programming projects.

## Features

-   Personal blog with posts on various topics.
-   Project showcase.
-   Dark mode toggle for user preference.
-   Responsive design for various screen sizes.

## Technology Stack

-   [Astro](https://astro.build/) for static site generation.
-   [Tailwind CSS](https://tailwindcss.com/) for styling.
-   [React](https://reactjs.org/) for interactive components.
-   [Shadcn](https://ui.shadcn.com/) for design.
-   [Ghost](https://ghost.org/) as a headless CMS for blog posts.
-   Hosted on [Cloudflare](https://cloudflare.com/).

## Development

To get started with development:

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.

## Notes

I ran this on the components (and to the navbar). Otherwise, the shadcn components are intact.

```bash
find src/components/ui -type f -name "*.tsx" -exec sed -i '' -e 's/transition-colors//g' -e 's/transition\([ "]\)/transition-transform\1/g' {} +
```

-   find src/components/ui starts the search within the specified directory.
-   -type f restricts the search to files.
-   -name "\*.tsx" looks for files with the .tsx extension.
-   -exec allows you to execute a command on each file found.
-   sed -i '' invokes the stream editor for in-place editing of files.
-   The -e flag is used to add multiple editing commands to sed.
-   s/transition-colors//g removes all occurrences of transition-colors.
-   s/transition\([ "]\)/transition-transform\1/g replaces transition followed by a space or quote with transition-transform followed by the same character.

## Deployment

The site is deployed using Cloudflare Pages. To deploy your changes, run `npm run deploy`. Make sure to use [nodejs_compat](https://developers.cloudflare.com/workers/runtime-apis/nodejs/).

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

Feel free to reach out at [jacobweinbren@gmail.com](mailto:jacobweinbren@gmail.com).
