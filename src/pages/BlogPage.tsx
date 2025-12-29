import Hero from '@/components/Hero'

export default function BlogPage() {
  return (
    <>
      <Hero
        variant="minimal"
        title="Blog"
        subtitle="Coming Soon"
      />
      <div className="container-custom py-16 text-center">
        <p className="text-zinc-400">Blog feature is under development. Check back soon!</p>
      </div>
    </>
  )
}
