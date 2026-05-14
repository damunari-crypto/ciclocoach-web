import type { DailyWorkout, WeeklyPlan } from './types'

const FTP_START     = 252
const FTP_POST_TEST = 272

// Zone helpers
const z1h  = (f: number) => Math.round(f * 0.55)
const z2l  = (f: number) => Math.round(f * 0.58)
const z2h  = (f: number) => Math.round(f * 0.75)
const z3l  = (f: number) => Math.round(f * 0.78)
const z3h  = (f: number) => Math.round(f * 0.90)
const ssl  = (f: number) => Math.round(f * 0.88)
const ssh  = (f: number) => Math.round(f * 0.95)
const thl  = (f: number) => Math.round(f * 0.95)
const thh  = (f: number) => Math.round(f * 1.05)
const vo2l = (f: number) => Math.round(f * 1.06)
const vo2h = (f: number) => Math.round(f * 1.20)
const rec  = (f: number) => Math.round(f * 0.60)

function rest(date: string, coachNote?: string): DailyWorkout {
  return {
    date, type: 'REST', venue: 'REST',
    durationMinutes: 0, tss: 0,
    summary: 'Riposo — recupero, idratazione e sonno di qualità.',
    mainIntervals: [], gymExercises: [],
    mainPowerMin: 0, mainPowerMax: 0,
    coachNote,
    nutritionNote: 'Giorno di riposo: mantieni idratazione (2-2.5L acqua). Proteine moderate per il recupero muscolare.',
  }
}

export function generatePlan(ftp: number = FTP_START): WeeklyPlan[] {
  const postFtp = ftp > FTP_START ? ftp : FTP_POST_TEST
  return [
    week1(ftp), week2(ftp), week3(ftp), week4(ftp),
    week5(ftp), week6(ftp), week7(ftp), week8(ftp),
    week9(postFtp), week10(postFtp), week11(postFtp),
  ]
}

export function workoutForDate(plan: WeeklyPlan[], date: string): DailyWorkout | undefined {
  return plan.flatMap(w => w.days).find(d => d.date === date)
}

export function currentWeek(plan: WeeklyPlan[], date: string): WeeklyPlan | undefined {
  return plan.find(w => {
    const start = new Date(w.startDate)
    const end   = new Date(start); end.setDate(end.getDate() + 6)
    const d     = new Date(date)
    return d >= start && d <= end
  })
}

// ── Settimana 1 ──────────────────────────────────────────────────────────────
function week1(ftp: number): WeeklyPlan {
  return {
    weekNumber: 1, startDate: '2026-04-25',
    phase: 'RECOVERY_BASE',
    weekGoal: 'Primo contatto con la bici dopo il blocco da ernia. Massimo comfort, zero dolore.',
    targetTSS: 80,
    days: [
      rest('2026-04-25', 'Primo giorno di rientro – solo mobilità lombare.'),
      rest('2026-04-26'), rest('2026-04-27'), rest('2026-04-28'), rest('2026-04-29'),
      {
        date: '2026-04-30', type: 'ENDURANCE', venue: 'ROAD',
        durationMinutes: 90, tss: 45,
        summary: 'Prima uscita post-ernia – Z1/Z2 libero',
        mainIntervals: [{
          name: 'Z1/Z2 libero', sets: 1, durationMinutes: 75,
          powerMin: z1h(ftp), powerMax: z3l(ftp),
          recoveryMinutes: 0, recoveryPowerMax: 0, cadence: [85, 95],
          notes: 'Pedala leggero, nessuna forzatura. Fermati al primo fastidio lombare.',
        }],
        gymExercises: [],
        mainPowerMin: z1h(ftp), mainPowerMax: z3l(ftp), cadenceTarget: [85, 95],
        coachNote: 'Obiettivo: tornare in sella e sentire il corpo. Zero prestazione.',
        nutritionNote: 'Solo idratazione (500ml/h). Nessun gel necessario.',
        backNote: 'Se senti tensione lombare, rialza il manubrio di 5mm.',
      },
      rest('2026-05-01'),
    ],
  }
}

// ── Settimana 2 ──────────────────────────────────────────────────────────────
function week2(ftp: number): WeeklyPlan {
  return {
    weekNumber: 2, startDate: '2026-05-04',
    phase: 'RECOVERY_BASE',
    weekGoal: 'Aggiungere una seconda uscita. Confermare tolleranza alla posizione.',
    targetTSS: 120,
    days: [
      rest('2026-05-04'), rest('2026-05-05'),
      {
        date: '2026-05-06', type: 'ENDURANCE', venue: 'ROLLERS',
        durationMinutes: 60, tss: 40,
        summary: 'Z2 rulli + esercizi singola gamba',
        warmup: { durationMinutes: 10, description: 'Riscaldamento Z1→Z2', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.71), cadence: [85,90] },
        mainIntervals: [{
          name: 'Z2 + singola gamba', sets: 1, durationMinutes: 35,
          powerMin: z2l(ftp), powerMax: z2h(ftp),
          recoveryMinutes: 0, recoveryPowerMax: 0, cadence: [90, 95],
          notes: 'Ogni 10 min: 1 min singola gamba (30s sx, 30s dx). Valuta simmetria.',
        }],
        cooldown: { durationMinutes: 10, description: 'Defaticamento Z1', powerMin: Math.round(ftp*0.40), powerMax: rec(ftp) },
        gymExercises: [],
        mainPowerMin: z2l(ftp), mainPowerMax: z2h(ftp), cadenceTarget: [90, 95],
        coachNote: 'ERG mode a ' + z2l(ftp) + 'W. Se senti tensione lombare, interrompi.',
        nutritionNote: 'Pre: caffè + banana 45 min prima. Durante: solo acqua.',
        backNote: 'Mantieni leggera inclinazione anteropelvica. Non andare in "piattola".',
      },
      rest('2026-05-07'),
      {
        date: '2026-05-08', type: 'GYM', venue: 'GYM',
        durationMinutes: 50, tss: 25,
        summary: 'Core & mobilità — sessione ernia-safe',
        mainIntervals: [],
        gymExercises: [
          { name: 'Dead Bug', sets: '3', reps: '10/lato', notes: 'Lombare incollata al pavimento', backSafe: true },
          { name: 'Bird Dog', sets: '3', reps: '12/lato', notes: 'Movimento lento e controllato', backSafe: true },
          { name: 'Plank isometrico', sets: '3', reps: '30-45s', notes: 'No compensazioni lombari', backSafe: true },
          { name: 'Glutei bridge', sets: '3', reps: '15', backSafe: true },
          { name: 'Cat-Cow mobilità', sets: '2', reps: '15', notes: 'Respirazione profonda', backSafe: true },
          { name: 'Hip flexor stretch', sets: '2', reps: '45s/lato', backSafe: true },
        ],
        mainPowerMin: 0, mainPowerMax: 0,
        coachNote: 'Nessun carico assiale. Zero flessioni con peso. Focus sulla qualità del movimento.',
      },
      {
        date: '2026-05-09', type: 'ENDURANCE', venue: 'ROAD',
        durationMinutes: 120, tss: 60,
        summary: 'Z2 costante – costruzione base aerobica',
        mainIntervals: [{
          name: 'Z2 endurance', sets: 1, durationMinutes: 105,
          powerMin: Math.round(ftp*0.63), powerMax: Math.round(ftp*0.83),
          recoveryMinutes: 0, recoveryPowerMax: 0, cadence: [88, 95],
          notes: 'Mantieni FC sotto 150 bpm. Percorso pianeggiante.',
        }],
        gymExercises: [],
        mainPowerMin: Math.round(ftp*0.63), mainPowerMax: Math.round(ftp*0.83), cadenceTarget: [88, 95],
        coachNote: 'Zero sforzi. Se vai in salita, metti il rapporto più leggero.',
        nutritionNote: 'Da 60 min in poi: 1 gel o 1 banana ogni 45 min.',
        backNote: 'Fai 5 min cat-cow prima di montare in bici.',
      },
      rest('2026-05-10'),
    ],
  }
}

// ── Settimana 3 ──────────────────────────────────────────────────────────────
function week3(ftp: number): WeeklyPlan {
  return {
    weekNumber: 3, startDate: '2026-05-11',
    phase: 'AEROBIC_BUILD',
    weekGoal: 'Introdurre il primo lavoro strutturato. 2×15 min Z3 dolce.',
    targetTSS: 180,
    days: [
      rest('2026-05-11'),
      {
        date: '2026-05-12', type: 'ENDURANCE', venue: 'ROLLERS',
        durationMinutes: 60, tss: 40,
        summary: 'Z2 rulli puri',
        warmup: { durationMinutes: 10, description: 'Riscaldamento Z1→Z2', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.71), cadence: [85,90] },
        mainIntervals: [{
          name: 'Z2 base', sets: 1, durationMinutes: 40,
          powerMin: z2l(ftp), powerMax: z2h(ftp),
          recoveryMinutes: 0, recoveryPowerMax: 0, cadence: [90, 95],
          notes: 'Cadenza alta e coperta morbida.',
        }],
        cooldown: { durationMinutes: 10, description: 'Defaticamento Z1', powerMin: Math.round(ftp*0.40), powerMax: rec(ftp) },
        gymExercises: [],
        mainPowerMin: z2l(ftp), mainPowerMax: z2h(ftp),
        nutritionNote: 'Pre: caffè + banana. Durante: acqua.',
      },
      {
        date: '2026-05-13', type: 'GYM', venue: 'GYM',
        durationMinutes: 55, tss: 28,
        summary: 'Core progressivo + mobilità',
        mainIntervals: [],
        gymExercises: [
          { name: 'Dead Bug con peso', sets: '3', reps: '10/lato', notes: '2kg per mano', backSafe: true },
          { name: 'Side Plank', sets: '3', reps: '30s/lato', backSafe: true },
          { name: 'Glutei bridge con pausa', sets: '3', reps: '12', notes: 'Pausa 2s in alto', backSafe: true },
          { name: 'Lat pulldown cavo basso', sets: '3', reps: '12', notes: 'Seduto, no torsione', backSafe: true },
          { name: 'Mobilità toracica', sets: '2', reps: '10', backSafe: true },
        ],
        mainPowerMin: 0, mainPowerMax: 0,
      },
      {
        date: '2026-05-14', type: 'TEMPO', venue: 'ROLLERS',
        durationMinutes: 75, tss: 65,
        summary: '2×15 min Z3 – primo lavoro strutturato',
        warmup: { durationMinutes: 15, description: 'Risveglio muscolare progressivo', powerMin: z1h(ftp), powerMax: z2h(ftp), cadence: [85,90] },
        mainIntervals: [{
          name: 'Z3 Tempo', sets: 2, durationMinutes: 15,
          powerMin: ssl(ftp), powerMax: Math.round(ftp*0.97),
          recoveryMinutes: 5, recoveryPowerMax: rec(ftp),
          cadence: [88, 95],
          notes: 'Rep 1: stabilizza la potenza nei primi 2 min. Rep 2: se ok, spingi verso ' + ssl(ftp) + 'W.',
        }],
        cooldown: { durationMinutes: 15, description: 'Defaticamento dolce', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.65) },
        gymExercises: [],
        mainPowerMin: ssl(ftp), mainPowerMax: Math.round(ftp*0.97),
        coachNote: 'Primo lavoro strutturato post-rientro. Al primo fastidio lombare, torna in Z2.',
        nutritionNote: 'Pre: banana + caffè 30 min prima. Post: 20g proteine entro 20 min.',
        backNote: 'Monitora la schiena durante le ripetute. Non inarcare mai la zona lombare.',
      },
      rest('2026-05-15'),
      {
        date: '2026-05-16', type: 'ENDURANCE', venue: 'ROAD',
        durationMinutes: 150, tss: 75,
        summary: 'Uscita lunga Z2 – 2.5h su strada',
        warmup: { durationMinutes: 15, description: 'Riscaldamento progressivo Z1→Z2', powerMin: Math.round(ftp*0.52), powerMax: z3l(ftp), cadence: [85,90] },
        mainIntervals: [{
          name: 'Endurance Z2', sets: 1, durationMinutes: 110,
          powerMin: z2l(ftp), powerMax: z2h(ftp),
          recoveryMinutes: 0, recoveryPowerMax: 0, cadence: [85, 92],
          notes: 'Percorso ondulato. In salita: metti il rapporto più leggero, mantieni Z2.',
        }],
        cooldown: { durationMinutes: 15, description: 'Defaticamento Z1', powerMin: Math.round(ftp*0.40), powerMax: Math.round(ftp*0.63) },
        gymExercises: [],
        mainPowerMin: z2l(ftp), mainPowerMax: z2h(ftp),
        coachNote: 'L\'uscita più lunga finora. Porta da mangiare per 2.5h.',
        nutritionNote: 'PRE: avena + yogurt greco + banana + caffè. DURANTE: 60g CHO/h da 45 min in poi. POST: pasta 100g + petto di pollo.',
        backNote: 'Se dopo 90 min senti tensione: 5 min fermo con cat-cow, poi decidi.',
      },
      rest('2026-05-17'),
    ],
  }
}

// ── Settimane 4-7: versioni semplificate ma complete ─────────────────────────
function week4(ftp: number): WeeklyPlan {
  return {
    weekNumber: 4, startDate: '2026-05-18',
    phase: 'AEROBIC_BUILD',
    weekGoal: 'Aumentare il volume Z2 e introdurre cadenza alta (95+ rpm).',
    targetTSS: 220,
    days: [
      rest('2026-05-18'),
      {
        date: '2026-05-19', type: 'ENDURANCE', venue: 'ROLLERS',
        durationMinutes: 75, tss: 52,
        summary: 'Z2 cadenza alta 95+ rpm',
        warmup: { durationMinutes: 8, description: 'Graduale', powerMin: Math.round(ftp*0.48), powerMax: Math.round(ftp*0.69) },
        mainIntervals: [{
          name: 'Z2 alta cadenza', sets: 1, durationMinutes: 60,
          powerMin: z2l(ftp), powerMax: z2h(ftp),
          recoveryMinutes: 0, recoveryPowerMax: 0, cadence: [95, 105],
          notes: 'Cadenza 95+ per tutta la sessione. Riduce stress sulla schiena.',
        }],
        cooldown: { durationMinutes: 7, description: 'Defaticamento', powerMin: Math.round(ftp*0.40), powerMax: rec(ftp) },
        gymExercises: [],
        mainPowerMin: Math.round(ftp*0.71), mainPowerMax: Math.round(ftp*0.85), cadenceTarget: [93, 100],
      },
      rest('2026-05-20'),
      {
        date: '2026-05-21', type: 'SWEET_SPOT', venue: 'ROLLERS',
        durationMinutes: 90, tss: 80,
        summary: '3×12 min Sweet Spot – primo SS del piano',
        warmup: { durationMinutes: 20, description: 'Z1/Z2 tranquillo', powerMin: rec(ftp), powerMax: Math.round(ftp*0.77), cadence: [85,90] },
        mainIntervals: [{
          name: 'Sweet Spot', sets: 3, durationMinutes: 12,
          powerMin: ssl(ftp), powerMax: Math.round(ftp*0.97),
          recoveryMinutes: 5, recoveryPowerMax: rec(ftp),
          cadence: [88, 95],
          notes: '3 ripetute. Recupero di 5 min è abbondante: usa per mangiare/bere.',
        }],
        cooldown: { durationMinutes: 20, description: 'Defaticamento Z1', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.67) },
        gymExercises: [],
        mainPowerMin: ssl(ftp), mainPowerMax: Math.round(ftp*0.98),
        coachNote: 'Obiettivo: completare le 3 ripetute in modo stabile.',
        nutritionNote: 'Pre: banana + caffè. Post: 20g proteine entro 20 min.',
      },
      rest('2026-05-22'),
      {
        date: '2026-05-23', type: 'LONG_RIDE', venue: 'ROAD',
        durationMinutes: 180, tss: 95,
        summary: 'Uscita 3h Z2 con finale Z3',
        warmup: { durationMinutes: 20, description: 'Z1/Z2 tranquillo', powerMin: rec(ftp), powerMax: Math.round(ftp*0.77), cadence: [85,90] },
        mainIntervals: [
          {
            name: 'Endurance Z2', sets: 1, durationMinutes: 120,
            powerMin: z2l(ftp), powerMax: z2h(ftp),
            recoveryMinutes: 0, recoveryPowerMax: 0, cadence: [85, 92],
            notes: 'Mantieni Z2 costante.',
          },
          {
            name: 'Finale Z3', sets: 1, durationMinutes: 20,
            powerMin: Math.round(ftp*0.67), powerMax: Math.round(ftp*0.96),
            recoveryMinutes: 0, recoveryPowerMax: 0,
            notes: 'Solo se lombari ok. Spingi dolcemente verso Z3.',
          },
        ],
        cooldown: { durationMinutes: 20, description: 'Defaticamento Z1', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.67) },
        gymExercises: [],
        mainPowerMin: Math.round(ftp*0.67), mainPowerMax: Math.round(ftp*0.96),
        nutritionNote: 'PRE: avena + yogurt + banana + caffè. DURANTE: 60g CHO/h da 45 min. POST: 30 min – riso 100g + pollo.',
      },
      rest('2026-05-24'),
    ],
  }
}

function week5(ftp: number): WeeklyPlan {
  return {
    weekNumber: 5, startDate: '2026-05-25',
    phase: 'SWEET_SPOT',
    weekGoal: 'Sweet Spot progressivo. Primo blocco da 20 min continui.',
    targetTSS: 250,
    days: [
      rest('2026-05-25'),
      {
        date: '2026-05-26', type: 'SWEET_SPOT', venue: 'ROLLERS',
        durationMinutes: 90, tss: 85,
        summary: '3×15 min Sweet Spot',
        warmup: { durationMinutes: 15, description: 'Z1→Z2 progressivo', powerMin: Math.round(ftp*0.52), powerMax: z3l(ftp), cadence: [85,90] },
        mainIntervals: [{
          name: 'Sweet Spot', sets: 3, durationMinutes: 15,
          powerMin: ssl(ftp), powerMax: Math.round(ftp*0.97),
          recoveryMinutes: 5, recoveryPowerMax: rec(ftp),
          cadence: [88, 95],
          notes: 'Rep 1: trova il ritmo. Rep 3: spingi se stai bene.',
        }],
        cooldown: { durationMinutes: 15, description: 'Defaticamento', powerMin: Math.round(ftp*0.40), powerMax: Math.round(ftp*0.63) },
        gymExercises: [],
        mainPowerMin: ssl(ftp), mainPowerMax: Math.round(ftp*0.98),
      },
      rest('2026-05-27'),
      {
        date: '2026-05-28', type: 'SWEET_SPOT', venue: 'ROLLERS',
        durationMinutes: 80, tss: 78,
        summary: '20 min continui Sweet Spot',
        warmup: { durationMinutes: 10, description: 'Z1→Z2', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.77), cadence: [85,90] },
        mainIntervals: [{
          name: 'SS blocco continuo', sets: 1, durationMinutes: 20,
          powerMin: ssl(ftp), powerMax: Math.round(ftp*0.97),
          recoveryMinutes: 0, recoveryPowerMax: 0, cadence: [88, 95],
          notes: 'Blocco continuo. Pacing: inizia a ' + ssl(ftp) + 'W, sale gradualmente.',
        }],
        cooldown: { durationMinutes: 15, description: 'Z1 lungo per recupero lombare', powerMin: Math.round(ftp*0.40), powerMax: Math.round(ftp*0.63) },
        gymExercises: [],
        mainPowerMin: ssl(ftp), mainPowerMax: Math.round(ftp*0.97),
        coachNote: 'Un blocco continuo da 20 min è più specifico per la gara.',
      },
      rest('2026-05-29'),
      {
        date: '2026-05-30', type: 'LONG_RIDE', venue: 'ROAD',
        durationMinutes: 210, tss: 115,
        summary: '3.5h con lavoro in salita Z2/Z3',
        warmup: { durationMinutes: 20, description: 'Riscaldamento su strada', powerMin: rec(ftp), powerMax: z3l(ftp), cadence: [85,90] },
        mainIntervals: [
          {
            name: 'Base Z2', sets: 1, durationMinutes: 100,
            powerMin: z2l(ftp), powerMax: z2h(ftp),
            recoveryMinutes: 0, recoveryPowerMax: 0,
          },
          {
            name: 'Salita Z3/SS', sets: 2, durationMinutes: 15,
            powerMin: ssl(ftp), powerMax: Math.round(ftp*0.97),
            recoveryMinutes: 10, recoveryPowerMax: z2l(ftp),
            cadence: [72, 85],
            notes: 'Salita 6-10 min. In salita cadenza scende: ok.',
          },
          {
            name: 'Rientro Z2', sets: 1, durationMinutes: 40,
            powerMin: z2l(ftp), powerMax: z2h(ftp),
            recoveryMinutes: 0, recoveryPowerMax: 0,
          },
        ],
        cooldown: { durationMinutes: 20, description: 'Defaticamento verso casa', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.67) },
        gymExercises: [],
        mainPowerMin: z2l(ftp), mainPowerMax: Math.round(ftp*0.98),
        nutritionNote: 'Scorte: 3-4 gel + 2 barrette + 1 banana + 2 bottiglie. Obiettivo: 70g CHO/h da 2h in poi.',
        backNote: 'In salita: inclina bacino in avanti, non curvarti in cifosi lombare.',
      },
      rest('2026-05-31'),
    ],
  }
}

function week6(ftp: number): WeeklyPlan {
  return {
    weekNumber: 6, startDate: '2026-06-01',
    phase: 'SWEET_SPOT',
    weekGoal: 'Volume Sweet Spot elevato. Prima attivazione con sprint brevi.',
    targetTSS: 280,
    days: [
      rest('2026-06-01'),
      {
        date: '2026-06-02', type: 'SWEET_SPOT', venue: 'ROLLERS',
        durationMinutes: 90, tss: 88,
        summary: '3×15 min SS + forza lenta',
        warmup: { durationMinutes: 15, description: 'Attivazione con 3×30s forza lenta a 60 rpm', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.83), cadence: [80,95] },
        mainIntervals: [{
          name: 'Sweet Spot', sets: 3, durationMinutes: 15,
          powerMin: ssl(ftp), powerMax: Math.round(ftp*0.97),
          recoveryMinutes: 5, recoveryPowerMax: rec(ftp), cadence: [88, 95],
        }],
        cooldown: { durationMinutes: 15, description: 'Defaticamento lungo per adattamento', powerMin: Math.round(ftp*0.40), powerMax: Math.round(ftp*0.65) },
        gymExercises: [],
        mainPowerMin: ssl(ftp), mainPowerMax: Math.round(ftp*0.98),
      },
      rest('2026-06-03'),
      {
        date: '2026-06-04', type: 'SWEET_SPOT', venue: 'ROLLERS',
        durationMinutes: 85, tss: 82,
        summary: '2×20 min Sweet Spot',
        warmup: { durationMinutes: 12, description: 'Riscaldamento + 2×1 min forza lenta', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.83) },
        mainIntervals: [{
          name: 'SS lungo', sets: 2, durationMinutes: 20,
          powerMin: ssl(ftp), powerMax: Math.round(ftp*0.97),
          recoveryMinutes: 6, recoveryPowerMax: rec(ftp), cadence: [88, 95],
        }],
        cooldown: { durationMinutes: 12, description: 'Defaticamento', powerMin: Math.round(ftp*0.40), powerMax: Math.round(ftp*0.65) },
        gymExercises: [],
        mainPowerMin: ssl(ftp), mainPowerMax: Math.round(ftp*0.98),
        coachNote: '2×20 min è il cuore del Sweet Spot training. Meglio ' + ssl(ftp) + 'W stabili che ' + thh(ftp) + 'W irregolare.',
      },
      rest('2026-06-05'),
      {
        date: '2026-06-06', type: 'LONG_RIDE', venue: 'ROAD',
        durationMinutes: 210, tss: 120,
        summary: '3.5h con 2 salite SS',
        warmup: { durationMinutes: 25, description: 'Z1/Z2 riscaldamento', powerMin: rec(ftp), powerMax: z3l(ftp), cadence: [85,90] },
        mainIntervals: [
          {
            name: 'Base Z2', sets: 1, durationMinutes: 90,
            powerMin: z2l(ftp), powerMax: z2h(ftp), recoveryMinutes: 0, recoveryPowerMax: 0,
          },
          {
            name: 'SS in salita', sets: 2, durationMinutes: 15,
            powerMin: ssl(ftp), powerMax: Math.round(ftp*0.97),
            recoveryMinutes: 10, recoveryPowerMax: z2l(ftp),
            cadence: [72, 85], notes: 'Salita 6-10 min. NP target ' + ssh(ftp) + 'W.',
          },
          {
            name: 'Finale Z2/Z3', sets: 1, durationMinutes: 40,
            powerMin: Math.round(ftp*0.69), powerMax: Math.round(ftp*0.89),
            recoveryMinutes: 0, recoveryPowerMax: 0, cadence: [88, 95],
          },
        ],
        cooldown: { durationMinutes: 25, description: 'Z1 verso casa', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.67) },
        gymExercises: [],
        mainPowerMin: z2l(ftp), mainPowerMax: thh(ftp),
      },
      rest('2026-06-07'),
    ],
  }
}

function week7(ftp: number): WeeklyPlan {
  return {
    weekNumber: 7, startDate: '2026-06-08',
    phase: 'SWEET_SPOT',
    weekGoal: 'Picco SS. 4×12 min con recupero ridotto. Prepara il test.',
    targetTSS: 290,
    days: [
      rest('2026-06-08'),
      {
        date: '2026-06-09', type: 'SWEET_SPOT', venue: 'ROLLERS',
        durationMinutes: 95, tss: 92,
        summary: '4×12 min SS recupero 6 min',
        warmup: { durationMinutes: 15, description: 'Attivazione con sprint brevi 3×15s', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.85), cadence: [80,90] },
        mainIntervals: [{
          name: 'Sweet Spot picco', sets: 4, durationMinutes: 12,
          powerMin: ssl(ftp), powerMax: Math.round(ftp*0.97),
          recoveryMinutes: 6, recoveryPowerMax: rec(ftp), cadence: [88, 95],
          notes: 'Recupero ridotto a 6 min. Se la 4a ripetuta non regge, fermati a 3.',
        }],
        cooldown: { durationMinutes: 15, description: 'Defaticamento lungo', powerMin: Math.round(ftp*0.40), powerMax: Math.round(ftp*0.65) },
        gymExercises: [],
        mainPowerMin: thl(ftp), mainPowerMax: vo2l(ftp),
        coachNote: '48 min totali nel SS. Carico elevato. Segui i recovery.',
      },
      rest('2026-06-10'),
      {
        date: '2026-06-11', type: 'TEMPO', venue: 'ROLLERS',
        durationMinutes: 80, tss: 75,
        summary: '2×20 min Tempo con progressione',
        warmup: { durationMinutes: 15, description: 'Riscaldamento progressivo', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.84) },
        mainIntervals: [{
          name: 'Tempo progressivo', sets: 2, durationMinutes: 20,
          powerMin: ssl(ftp), powerMax: Math.round(ftp*0.97),
          recoveryMinutes: 8, recoveryPowerMax: rec(ftp), cadence: [88, 95],
        }],
        cooldown: { durationMinutes: 15, description: 'Defaticamento', powerMin: Math.round(ftp*0.40), powerMax: Math.round(ftp*0.65) },
        gymExercises: [],
        mainPowerMin: ssl(ftp), mainPowerMax: Math.round(ftp*0.97),
      },
      rest('2026-06-12'),
      {
        date: '2026-06-13', type: 'LONG_RIDE', venue: 'ROAD',
        durationMinutes: 240, tss: 135,
        summary: '4h Z2 con salite multiple',
        warmup: { durationMinutes: 30, description: 'Z1/Z2 riscaldamento graduale', powerMin: rec(ftp), powerMax: Math.round(ftp*0.81), cadence: [85,92] },
        mainIntervals: [
          {
            name: 'Fondo Z2', sets: 1, durationMinutes: 120,
            powerMin: z2l(ftp), powerMax: z2h(ftp), recoveryMinutes: 0, recoveryPowerMax: 0,
          },
          {
            name: 'SS in salita', sets: 3, durationMinutes: 12,
            powerMin: ssl(ftp), powerMax: Math.round(ftp*0.97),
            recoveryMinutes: 8, recoveryPowerMax: z2l(ftp),
          },
          {
            name: 'Rientro Z2', sets: 1, durationMinutes: 48,
            powerMin: z2l(ftp), powerMax: z2h(ftp), recoveryMinutes: 0, recoveryPowerMax: 0,
          },
        ],
        cooldown: { durationMinutes: 30, description: 'Z1 defaticamento', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.67) },
        gymExercises: [],
        mainPowerMin: z1h(ftp) - 20, mainPowerMax: ssh(ftp),
      },
      rest('2026-06-14'),
    ],
  }
}

// ── Settimana 8 – Test FTP ────────────────────────────────────────────────────
function week8(ftp: number): WeeklyPlan {
  return {
    weekNumber: 8, startDate: '2026-06-15',
    phase: 'THRESHOLD_VO2',
    weekGoal: 'Settimana test FTP. Taper leggero poi ramp test giovedì.',
    targetTSS: 180,
    days: [
      rest('2026-06-15'),
      {
        date: '2026-06-16', type: 'RECOVERY', venue: 'ROLLERS',
        durationMinutes: 60, tss: 30,
        summary: 'Z1 puro – scarico pre-test',
        mainIntervals: [{
          name: 'Recupero Z1', sets: 1, durationMinutes: 55,
          powerMin: Math.round(ftp*0.32), powerMax: rec(ftp),
          recoveryMinutes: 0, recoveryPowerMax: 0, cadence: [85, 95],
        }],
        gymExercises: [],
        mainPowerMin: Math.round(ftp*0.32), mainPowerMax: rec(ftp),
        coachNote: 'Gambe libere. Zero intensità. Prepara il test.',
      },
      rest('2026-06-17'),
      {
        date: '2026-06-18', type: 'THRESHOLD', venue: 'ROLLERS',
        durationMinutes: 75, tss: 95,
        summary: '🏆 TEST FTP – Ramp Test sul Kickr',
        warmup: { durationMinutes: 20, description: 'Riscaldamento completo + 2×30s sprint', powerMin: z1h(ftp), powerMax: Math.round(ftp*0.87) },
        mainIntervals: [
          {
            name: 'RAMP TEST',
            sets: 1, durationMinutes: 25,
            powerMin: Math.round(ftp*0.48), powerMax: ftp * 2,
            recoveryMinutes: 5, recoveryPowerMax: Math.round(ftp*0.40),
            cadence: [85, 100],
            notes: 'Inizia a ' + Math.round(ftp*0.48) + 'W. Ogni MINUTO +20W fino al cedimento.\nFTP = 75% della potenza dell\'ultimo minuto completato.\nUsa Wahoo o Garmin per il protocollo automatico.',
          },
        ],
        cooldown: { durationMinutes: 15, description: 'Recupero leggero dopo il test', powerMin: Math.round(ftp*0.32), powerMax: rec(ftp) },
        gymExercises: [],
        mainPowerMin: Math.round(ftp*0.48), mainPowerMax: ftp * 2,
        coachNote: 'GIORNATA FONDAMENTALE. Il test ridefinisce tutte le zone per le ultime 3 settimane.',
        nutritionNote: 'Pre-test: colazione normale 2h prima. Caffè 45 min prima. POST: 30g proteine + 80g CHO entro 20 min.',
      },
      rest('2026-06-19'),
      {
        date: '2026-06-20', type: 'ENDURANCE', venue: 'ROAD',
        durationMinutes: 150, tss: 70,
        summary: 'Z2 post-test – recupero attivo',
        mainIntervals: [{
          name: 'Z2 leggero', sets: 1, durationMinutes: 140,
          powerMin: z2l(ftp), powerMax: z2h(ftp),
          recoveryMinutes: 0, recoveryPowerMax: 0,
        }],
        gymExercises: [],
        mainPowerMin: z2l(ftp), mainPowerMax: z2h(ftp),
      },
      rest('2026-06-21'),
    ],
  }
}

// ── Settimana 9 – Soglia ──────────────────────────────────────────────────────
function week9(ftp: number): WeeklyPlan {
  return {
    weekNumber: 9, startDate: '2026-06-22',
    phase: 'THRESHOLD_VO2',
    weekGoal: 'Primo lavoro di soglia con FTP aggiornato. 2×20 min Threshold.',
    targetTSS: 300,
    days: [
      rest('2026-06-22'),
      {
        date: '2026-06-23', type: 'THRESHOLD', venue: 'ROLLERS',
        durationMinutes: 90, tss: 100,
        summary: '2×20 min Soglia',
        warmup: { durationMinutes: 20, description: 'Riscaldamento lungo con accelerazioni', powerMin: z1h(ftp), powerMax: thl(ftp) },
        mainIntervals: [{
          name: 'Threshold', sets: 2, durationMinutes: 20,
          powerMin: thl(ftp), powerMax: thh(ftp),
          recoveryMinutes: 10, recoveryPowerMax: rec(ftp), cadence: [88, 95],
          notes: 'Intensità 9/10. Stabile e controllata per tutta la durata.',
        }],
        cooldown: { durationMinutes: 20, description: 'Defaticamento lungo obbligatorio', powerMin: Math.round(ftp*0.40), powerMax: Math.round(ftp*0.65) },
        gymExercises: [],
        mainPowerMin: thl(ftp), mainPowerMax: thh(ftp),
        coachNote: 'Benvenuto alla soglia. Questo è il lavoro che ti porterà all\'evento.',
      },
      rest('2026-06-24'),
      {
        date: '2026-06-25', type: 'THRESHOLD', venue: 'ROLLERS',
        durationMinutes: 85, tss: 95,
        summary: '3×15 min Soglia',
        warmup: { durationMinutes: 18, description: 'Riscaldamento completo', powerMin: z1h(ftp), powerMax: thl(ftp) },
        mainIntervals: [{
          name: 'Threshold 3×15', sets: 3, durationMinutes: 15,
          powerMin: thl(ftp), powerMax: thh(ftp),
          recoveryMinutes: 8, recoveryPowerMax: rec(ftp), cadence: [88, 95],
        }],
        cooldown: { durationMinutes: 20, description: 'Defaticamento lungo', powerMin: Math.round(ftp*0.40), powerMax: Math.round(ftp*0.65) },
        gymExercises: [],
        mainPowerMin: thl(ftp), mainPowerMax: thh(ftp),
      },
      rest('2026-06-26'),
      {
        date: '2026-06-27', type: 'LONG_RIDE', venue: 'ROAD',
        durationMinutes: 240, tss: 130,
        summary: '4h con blocchi Threshold in salita',
        warmup: { durationMinutes: 30, description: 'Z1/Z2 riscaldamento', powerMin: rec(ftp), powerMax: Math.round(ftp*0.81), cadence: [85,92] },
        mainIntervals: [
          {
            name: 'Base Z2', sets: 1, durationMinutes: 90,
            powerMin: z2l(ftp), powerMax: z2h(ftp), recoveryMinutes: 0, recoveryPowerMax: 0,
          },
          {
            name: 'Threshold in salita', sets: 2, durationMinutes: 20,
            powerMin: thl(ftp), powerMax: thh(ftp),
            recoveryMinutes: 15, recoveryPowerMax: z2l(ftp),
            cadence: [72, 85],
          },
          {
            name: 'Rientro Z2', sets: 1, durationMinutes: 60,
            powerMin: z2l(ftp), powerMax: z2h(ftp), recoveryMinutes: 0, recoveryPowerMax: 0,
          },
        ],
        cooldown: { durationMinutes: 30, description: 'Z1 verso casa', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.67) },
        gymExercises: [],
        mainPowerMin: thl(ftp), mainPowerMax: thh(ftp),
      },
      rest('2026-06-28'),
    ],
  }
}

// ── Settimana 10 – VO2max ─────────────────────────────────────────────────────
function week10(ftp: number): WeeklyPlan {
  return {
    weekNumber: 10, startDate: '2026-06-29',
    phase: 'THRESHOLD_VO2',
    weekGoal: 'Primo VO2max. Uscita obiettivo: 10km/6% con piatto 50.',
    targetTSS: 310,
    days: [
      rest('2026-06-29'),
      {
        date: '2026-06-30', type: 'VO2MAX', venue: 'ROLLERS',
        durationMinutes: 75, tss: 98,
        summary: '5×4 min VO2max – primo sprint della stagione',
        warmup: { durationMinutes: 20, description: 'Riscaldamento lungo con sprint 3×30s', powerMin: z1h(ftp), powerMax: Math.round(ftp*0.99) },
        mainIntervals: [{
          name: 'VO2max', sets: 5, durationMinutes: 4,
          powerMin: vo2l(ftp), powerMax: vo2h(ftp),
          recoveryMinutes: 4, recoveryPowerMax: Math.round(ftp*0.40),
          cadence: [95, 105],
          notes: 'Intensità massimale sostenibile. Se non reggi 5, fermati a 4.',
        }],
        cooldown: { durationMinutes: 15, description: 'Defaticamento lungo obbligatorio Z1', powerMin: Math.round(ftp*0.32), powerMax: rec(ftp) },
        gymExercises: [],
        mainPowerMin: vo2l(ftp), mainPowerMax: vo2h(ftp),
        coachNote: 'Alta intensità — monitora attentamente la schiena.',
      },
      rest('2026-07-01'),
      {
        date: '2026-07-02', type: 'THRESHOLD', venue: 'ROLLERS',
        durationMinutes: 80, tss: 88,
        summary: '3×15 min Soglia – consolidamento',
        warmup: { durationMinutes: 18, description: 'Riscaldamento completo', powerMin: z1h(ftp), powerMax: Math.round(ftp*0.97) },
        mainIntervals: [{
          name: 'Threshold consolidamento', sets: 3, durationMinutes: 15,
          powerMin: thl(ftp), powerMax: thh(ftp),
          recoveryMinutes: 8, recoveryPowerMax: rec(ftp), cadence: [88, 95],
          notes: 'Rep 1: ritmo. Rep 2: mantieni. Rep 3: tutto quello che hai.',
        }],
        cooldown: { durationMinutes: 20, description: 'Defaticamento', powerMin: Math.round(ftp*0.40), powerMax: Math.round(ftp*0.64) },
        gymExercises: [],
        mainPowerMin: vo2l(ftp), mainPowerMax: vo2h(ftp),
      },
      rest('2026-07-03'),
      {
        date: '2026-07-04', type: 'LONG_RIDE', venue: 'ROAD',
        durationMinutes: 300, tss: 160,
        summary: '🎯 USCITA OBIETTIVO – 10km/6% con piatto 50',
        warmup: { durationMinutes: 40, description: 'Lunga preparazione alla salita', powerMin: z2l(ftp), powerMax: Math.round(ftp*0.81), cadence: [85,92] },
        mainIntervals: [
          {
            name: 'Salita obiettivo 10km/6%', sets: 1, durationMinutes: 40,
            powerMin: thl(ftp), powerMax: thh(ftp),
            recoveryMinutes: 0, recoveryPowerMax: 0,
            cadence: [65, 80],
            notes: 'MOMENTO DELLA VERITÀ. Piatto 50. Pacing: parti conservativo nei primi 3km, spingi dal 5km in poi.',
          },
          {
            name: 'Rientro Z2', sets: 1, durationMinutes: 90,
            powerMin: Math.round(ftp*0.59), powerMax: z2h(ftp),
            recoveryMinutes: 0, recoveryPowerMax: 0,
            notes: 'Dopo la salita: mangia subito, bevi, goditi il rientro in Z2.',
          },
        ],
        cooldown: { durationMinutes: 40, description: 'Rientro finale', powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.67) },
        gymExercises: [],
        mainPowerMin: z2l(ftp), mainPowerMax: thh(ftp),
        coachNote: 'USCITA DEL PIANO. Registra tutto su Strava: tempo, NP, FC.',
        nutritionNote: 'Scorte per 5h. Obiettivo: 90g CHO/h da 1h in poi (mix glucosio+fruttosio).',
      },
      rest('2026-07-05'),
    ],
  }
}

// ── Settimana 11 – Taper ──────────────────────────────────────────────────────
function week11(ftp: number): WeeklyPlan {
  return {
    weekNumber: 11, startDate: '2026-07-06',
    phase: 'TAPER',
    weekGoal: 'Taper. Volume -40%, intensità mantenuta. Gambe fresche per l\'evento.',
    targetTSS: 160,
    days: [
      rest('2026-07-06'),
      {
        date: '2026-07-07', type: 'SWEET_SPOT', venue: 'ROLLERS',
        durationMinutes: 60, tss: 55,
        summary: '2×10 min SS – mantenimento intensità',
        warmup: { durationMinutes: 18, description: 'Riscaldamento + sprint 3×20s', powerMin: z1h(ftp), powerMax: Math.round(ftp*0.99) },
        mainIntervals: [{
          name: 'SS taper', sets: 2, durationMinutes: 10,
          powerMin: ssl(ftp), powerMax: ssh(ftp),
          recoveryMinutes: 6, recoveryPowerMax: rec(ftp), cadence: [88, 95],
          notes: 'Volume ridotto, qualità mantenuta. Non stancarti.',
        }],
        cooldown: { durationMinutes: 18, description: 'Defaticamento lungo Z1', powerMin: Math.round(ftp*0.32), powerMax: rec(ftp) },
        gymExercises: [],
        mainPowerMin: z1h(ftp) - 20, mainPowerMax: ssh(ftp),
      },
      rest('2026-07-08'),
      {
        date: '2026-07-09', type: 'THRESHOLD', venue: 'ROLLERS',
        durationMinutes: 55, tss: 60,
        summary: '1×15 min Threshold – picco di attivazione',
        warmup: { durationMinutes: 18, description: 'Riscaldamento completo', powerMin: z1h(ftp), powerMax: Math.round(ftp*0.97) },
        mainIntervals: [{
          name: 'Threshold singolo', sets: 1, durationMinutes: 15,
          powerMin: thl(ftp), powerMax: thh(ftp),
          recoveryMinutes: 0, recoveryPowerMax: 0, cadence: [88, 95],
          notes: 'Un solo blocco. Senti le gambe rispondere.',
        }],
        cooldown: { durationMinutes: 18, description: 'Defaticamento lungo', powerMin: Math.round(ftp*0.40), powerMax: Math.round(ftp*0.64) },
        gymExercises: [],
        mainPowerMin: thl(ftp), mainPowerMax: thh(ftp),
      },
      rest('2026-07-10'),
      {
        date: '2026-07-11', type: 'ENDURANCE', venue: 'ROAD',
        durationMinutes: 120, tss: 55,
        summary: 'Uscita finale pre-evento – test gambe',
        warmup: { durationMinutes: 20, description: 'Z1/Z2 progressivo', powerMin: z2l(ftp), powerMax: z3l(ftp), cadence: [85,92] },
        mainIntervals: [
          {
            name: 'Z2 progressivo', sets: 1, durationMinutes: 60,
            powerMin: z2l(ftp), powerMax: z2h(ftp), recoveryMinutes: 0, recoveryPowerMax: 0,
            cadence: [88, 95],
            notes: 'Senti le gambe: dovrebbero sentirsi fresche e reattive.',
          },
          {
            name: 'Rientro Z1', sets: 1, durationMinutes: 30,
            powerMin: Math.round(ftp*0.52), powerMax: Math.round(ftp*0.67),
            recoveryMinutes: 0, recoveryPowerMax: 0,
            notes: 'Torna a casa piano. Conserva tutto per lunedì.',
          },
        ],
        cooldown: { durationMinutes: 20, description: 'Defaticamento verso casa', powerMin: Math.round(ftp*0.48), powerMax: Math.round(ftp*0.65) },
        gymExercises: [],
        mainPowerMin: z1h(ftp) - 20, mainPowerMax: ssh(ftp),
        coachNote: 'Questa è l\'ultima uscita. Come ti senti? Annota tutto.',
      },
      rest('2026-07-12'),
    ],
  }
}
