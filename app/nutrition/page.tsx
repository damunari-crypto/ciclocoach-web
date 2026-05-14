export default function NutritionPage() {
  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Piano Nutrizionale</h1>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>
        Personalizzato per 85kg, obiettivo luglio 2026
      </p>

      {nutritionDays.map(day => <DayCard key={day.type} day={day} />)}
    </div>
  )
}

function DayCard({ day }: { day: typeof nutritionDays[0] }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{
        background: day.bg, padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{day.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: day.color }}>{day.label}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{day.description}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: day.color }}>{day.kcal}</div>
          <div style={{ fontSize: 10, color: 'var(--text-2)' }}>kcal</div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Macros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
          <MacroBar label="Carboidrati" value={day.cho} color="var(--orange)" unit="g" />
          <MacroBar label="Proteine" value={day.pro} color="var(--green)" unit="g" />
          <MacroBar label="Grassi" value={day.fat} color="var(--blue)" unit="g" />
        </div>

        {/* Pasti */}
        {day.meals.map((meal, i) => (
          <div key={i} style={{
            padding: '10px 0', borderBottom: i < day.meals.length - 1 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{meal.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{meal.time}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{meal.content}</div>
            {meal.kcal && (
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{meal.kcal} kcal</div>
            )}
          </div>
        ))}

        {/* Note intra-ride */}
        {day.intraRide && (
          <div style={{
            marginTop: 12, background: 'var(--orange-lt)', borderRadius: 10,
            padding: '10px 12px', fontSize: 12, color: 'var(--orange)', lineHeight: 1.5
          }}>
            🚴 <strong>Durante l'uscita:</strong> {day.intraRide}
          </div>
        )}
      </div>
    </div>
  )
}

function MacroBar({ label, value, color, unit }: { label: string; value: number; color: string; unit: string }) {
  return (
    <div style={{ textAlign: 'center', background: 'var(--bg)', borderRadius: 10, padding: '10px 6px' }}>
      <div style={{ fontSize: 18, fontWeight: 900, color }}>{value}{unit}</div>
      <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

const nutritionDays = [
  {
    type: 'rest', label: 'Giorno di Riposo', emoji: '😴', description: 'Recupero e ricostruzione',
    color: 'var(--gray)', bg: 'var(--gray-lt)',
    kcal: 2100, cho: 210, pro: 160, fat: 65,
    meals: [
      { name: 'Colazione', time: '08:00', content: 'Yogurt greco 200g + fiocchi d\'avena 60g + frutti di bosco + caffè', kcal: 420 },
      { name: 'Pranzo', time: '12:30', content: 'Riso basmati 90g + petto di pollo 180g + verdure grigliate + olio EVO 10g', kcal: 580 },
      { name: 'Spuntino', time: '16:00', content: 'Frutta fresca + 20g mandorle', kcal: 200 },
      { name: 'Cena', time: '19:30', content: 'Pasta integrale 80g + salmone 160g + insalata mista + olio EVO 10g', kcal: 620 },
    ],
    intraRide: undefined,
  },
  {
    type: 'light', label: 'Allenamento Leggero', emoji: '🚴', description: 'Z1/Z2 ≤ 90 min',
    color: 'var(--blue)', bg: 'var(--blue-lt)',
    kcal: 2500, cho: 270, pro: 160, fat: 70,
    meals: [
      { name: 'Pre-allenamento', time: '-45 min', content: 'Banana + caffè americano', kcal: 120 },
      { name: 'Colazione', time: '08:00', content: 'Yogurt greco 200g + avena 70g + banana + miele', kcal: 520 },
      { name: 'Pranzo', time: '13:00', content: 'Riso 100g cotto + tonno 160g + verdure + olio 10g', kcal: 580 },
      { name: 'Spuntino', time: '16:00', content: 'Frutto + ricotta 100g', kcal: 180 },
      { name: 'Cena', time: '19:30', content: 'Pasta 90g + pollo 160g + verdure saltate + olio 10g', kcal: 640 },
    ],
    intraRide: 'Acqua 500ml/h. Se >75 min: 1 gel o banana a metà.',
  },
  {
    type: 'hard', label: 'Allenamento Intenso', emoji: '🔥', description: 'SS/Soglia/VO2max',
    color: 'var(--orange)', bg: 'var(--orange-lt)',
    kcal: 3000, cho: 350, pro: 165, fat: 75,
    meals: [
      { name: 'Pre-allenamento', time: '-45 min', content: 'Banana + caffè + 30g gel o barretta', kcal: 200 },
      { name: 'Colazione', time: '08:00', content: 'Avena 100g + latte ps 200ml + banana + uova 2 + caffè', kcal: 680 },
      { name: 'Post-allenamento', time: 'Subito', content: 'Shake: 30g whey + 80g CHO (riso soffiato o maltodestrine) + frutta', kcal: 450 },
      { name: 'Pranzo', time: '13:00', content: 'Riso/pasta 120g + pollo 180g + verdure + olio 10g', kcal: 720 },
      { name: 'Cena', time: '19:30', content: 'Pasta integrale 90g + pesce 160g + verdure + olio 10g', kcal: 680 },
    ],
    intraRide: '60-80g CHO/h. Gel ogni 30-40 min + borraccia con carboidrati. Sodio 500mg/h in estate.',
  },
  {
    type: 'long', label: 'Uscita Lunga', emoji: '🏔️', description: '3h+, D+ elevato',
    color: 'var(--purple)', bg: 'var(--purple-lt)',
    kcal: 3400, cho: 420, pro: 160, fat: 80,
    meals: [
      { name: 'Colazione (2h prima)', time: '06:30', content: 'Avena 120g + yogurt 200g + banana + miele + caffè', kcal: 720 },
      { name: 'Post-uscita (entro 30 min)', time: 'Subito', content: '30g whey + 100g maltodestrine + 1 banana + acqua', kcal: 530 },
      { name: 'Pranzo', time: 'Post', content: 'Riso 140g + uova 3 + verdure + olio 15g', kcal: 780 },
      { name: 'Cena leggera', time: '19:30', content: 'Zuppa di legumi + pollo 120g + pane integrale', kcal: 580 },
    ],
    intraRide: 'Ore 0-1h: 40g CHO/h (1 gel). Ore 1-3h+: 80-90g CHO/h (mix gel+solido+bevanda). Acqua 700ml/h. Sodio 600mg/h.',
  },
]
