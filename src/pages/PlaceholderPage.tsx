interface PlaceholderPageProps { title: string; description?: string }

export function PlaceholderPage({ title, description = 'This workspace is ready for your Syllora data.' }: PlaceholderPageProps) {
  return <section className="placeholder-page"><p className="placeholder-page__eyebrow">Syllora workspace</p><h1>{title}</h1><p>{description}</p></section>;
}
