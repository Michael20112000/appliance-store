const steps = [
  {
    title: "Оберіть категорію",
    description: "Знайдіть потрібну техніку серед восьми напрямків.",
  },
  {
    title: "Оформіть замовлення",
    description: "Додайте товар у кошик і вкажіть спосіб отримання у Львові.",
  },
  {
    title: "Звʼяжіться з магазином",
    description: "За потреби напишіть нам у чат — допоможемо з вибором.",
  },
] as const;

export function HowToBuy() {
  return (
    <section className="bg-muted/50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="mb-8 text-2xl font-semibold">Як купити</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="space-y-2">
              <span className="text-sm font-medium text-primary">
                Крок {index + 1}
              </span>
              <h3 className="text-lg font-medium">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
