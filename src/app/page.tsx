import Link from "next/link";
import Image from "next/image";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const PROJECTS_QUERY = `*[
  _type == "project"
  && defined(slug.current)
]|order(publishedAt desc){
  _id, 
  title, 
  slug, 
  description,
  category,
  publishedAt,
  featured,
  featuredImage
}`;

const { projectId, dataset } = client.config();
const urlFor = (source: any) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default async function Home() {
  const projects = await client.fetch<SanityDocument[]>(PROJECTS_QUERY);
  const featuredProjects = projects.filter((p) => p.featured);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <section className="px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Glassfaceworld
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl">
            Creative works by Face. Music, visual art, video, and design.
          </p>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="px-6 py-12 md:px-12 lg:px-24 border-t border-zinc-800">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-8">
              Featured
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Projects */}
      <section className="px-6 py-12 md:px-12 lg:px-24 border-t border-zinc-800">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-8">
            All Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 md:px-12 lg:px-24 border-t border-zinc-800">
        <div className="mx-auto max-w-6xl flex justify-between items-center">
          <p className="text-zinc-500">© 2026 Glassfaceworld</p>
          <div className="flex gap-6">
            <Link href="/about" className="text-zinc-400 hover:text-white transition">
              About
            </Link>
            <Link href="/contact" className="text-zinc-400 hover:text-white transition">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ProjectCard({ project }: { project: SanityDocument }) {
  const imageUrl = project.featuredImage
    ? urlFor(project.featuredImage)?.width(600).height(400).url()
    : null;

  return (
    <Link
      href={`/${project.slug.current}`}
      className="group block"
    >
      <div className="aspect-[3/2] bg-zinc-900 rounded-lg overflow-hidden mb-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            No image
          </div>
        )}
      </div>
      <div className="space-y-2">
        {project.category && (
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            {project.category.replace('-', ' ')}
          </span>
        )}
        <h3 className="text-xl font-semibold group-hover:text-zinc-300 transition">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-zinc-400 line-clamp-2">{project.description}</p>
        )}
      </div>
    </Link>
  );
}
