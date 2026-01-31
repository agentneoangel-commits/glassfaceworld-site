import Link from "next/link";
import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { type SanityDocument } from "next-sanity";
import { PortableText } from "next-sanity";
import { client } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const PROJECT_QUERY = `*[_type == "project" && slug.current == $slug][0]`;
const PAGE_QUERY = `*[_type == "page" && slug.current == $slug][0]`;

const { projectId, dataset } = client.config();
const urlFor = (source: any) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

async function getProject(slug: string): Promise<SanityDocument | null> {
  // Try Sanity first
  try {
    const project = await client.fetch<SanityDocument>(PROJECT_QUERY, { slug });
    if (project) return project;
  } catch (e) {
    console.log('Sanity fetch failed for project');
  }
  
  // Fallback to local JSON
  try {
    const filePath = path.join(process.cwd(), 'src', 'app', 'data', 'projects.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const projects = JSON.parse(fileContents);
    return projects.find((p: any) => p.slug.current === slug) || null;
  } catch (e) {
    return null;
  }
}

async function getPage(slug: string): Promise<SanityDocument | null> {
  try {
    return await client.fetch<SanityDocument>(PAGE_QUERY, { slug });
  } catch (e) {
    return null;
  }
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Try project first, then page
  const project = await getProject(slug);
  if (project) {
    return <ProjectView project={project} />;
  }
  
  const page = await getPage(slug);
  if (page) {
    return <PageView page={page} />;
  }

  // Not found
  notFound();
}

function ProjectView({ project }: { project: SanityDocument }) {
  const imageUrl = project.featuredImage
    ? urlFor(project.featuredImage)?.width(1200).height(675).url()
    : null;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="px-6 py-12 md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition"
          >
            ← Back to projects
          </Link>

          {project.category && (
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
              {project.category.replace('-', ' ')}
            </span>
          )}

          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-8">
            {project.title}
          </h1>

          {project.artist && (
            <p className="text-xl text-zinc-400 mb-6">{project.artist}</p>
          )}

          {imageUrl && (
            <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden mb-12">
              <img
                src={imageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {project.description && (
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
              {project.description}
            </p>
          )}

          {project.gallery && project.gallery.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {project.gallery.map((image: any, index: number) => {
                const galleryUrl = urlFor(image)?.width(600).height(400).url();
                return galleryUrl ? (
                  <div
                    key={index}
                    className="aspect-[3/2] bg-zinc-900 rounded-lg overflow-hidden"
                  >
                    <img
                      src={galleryUrl}
                      alt={`${project.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null;
              })}
            </div>
          )}

          {project.externalUrl && (
            <a
              href={project.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition"
            >
              View Project
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </main>
  );
}

function PageView({ page }: { page: SanityDocument }) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="px-6 py-12 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition"
          >
            ← Back to home
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-8">{page.title}</h1>

          {page.content && (
            <div className="prose prose-invert prose-zinc max-w-none">
              <PortableText value={page.content} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Pre-render all project routes
export async function generateStaticParams() {
  // Get all project slugs from local JSON
  try {
    const filePath = path.join(process.cwd(), 'src', 'app', 'data', 'projects.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const projects = JSON.parse(fileContents);
    const projectSlugs = projects.map((p: any) => ({ slug: p.slug.current }));
    
    // Add static pages
    return [
      { slug: "about" },
      { slug: "contact" },
      ...projectSlugs,
    ];
  } catch (e) {
    return [
      { slug: "about" },
      { slug: "contact" },
    ];
  }
}
