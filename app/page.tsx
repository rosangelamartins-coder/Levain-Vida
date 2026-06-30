"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wheat,
  Droplet,
  Flame,
  Scale,
  Timer,
  Compass,
  HelpCircle,
  Send,
  RefreshCw,
  Play,
  Pause,
  Sparkles,
  BookOpen,
  TrendingUp,
  CheckCircle,
  ChevronRight,
  Info,
  Clock,
  Check,
  RotateCcw,
  Volume2,
  Calendar,
  Paperclip,
  UploadCloud,
  X
} from "lucide-react";

// Sourdough Markdown and Google Calendar link renderer
const SourdoughMarkdownRenderer = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  
  return (
    <div className="space-y-1.5 text-[11px] leading-relaxed font-sans text-[#4a3f35]">
      {lines.map((line, lineIdx) => {
        const isHeader3 = line.startsWith('### ');
        const isHeader2 = line.startsWith('## ');
        const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().startsWith('• ');
        
        let displayLine = line;
        if (isHeader3) displayLine = line.substring(4);
        else if (isHeader2) displayLine = line.substring(3);
        else if (isBullet) {
          const idx = line.indexOf('* ') !== -1 
            ? line.indexOf('* ') 
            : line.indexOf('- ') !== -1 
              ? line.indexOf('- ') 
              : line.indexOf('• ');
          displayLine = line.substring(idx + 2);
        }
        
        const parsedNodes = parseInlineMarkdown(displayLine);
        
        if (isHeader3) {
          return <h4 key={lineIdx} className="text-xs font-serif font-bold text-[#5c4033] mt-2 mb-0.5">{parsedNodes}</h4>;
        }
        if (isHeader2) {
          return <h3 key={lineIdx} className="text-sm font-serif font-bold text-[#5c4033] mt-3 mb-1">{parsedNodes}</h3>;
        }
        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1.5 my-0.5">
              <span className="text-[#a68a64] shrink-0 font-bold">•</span>
              <span className="flex-1 text-[#4a3f35] font-medium">{parsedNodes}</span>
            </div>
          );
        }
        
        if (line.trim() === '') {
          return <div key={lineIdx} className="h-1.5" />;
        }
        
        return <p key={lineIdx} className="font-medium text-[#4a3f35]">{parsedNodes}</p>;
      })}
    </div>
  );
};

function parseInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  let currentKey = 0;

  // Match: [Text](URL)
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    const [fullMatch, linkText, linkUrl] = match;

    if (matchIndex > lastIndex) {
      const precedingText = text.substring(lastIndex, matchIndex);
      parts.push(...parseBold(precedingText, currentKey));
      currentKey += 10;
    }

    const isGoogleCalendar = linkUrl.includes("calendar.google.com");
    if (isGoogleCalendar) {
      parts.push(
        <a
          key={`link-${currentKey}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 my-1 bg-[#5c4033] hover:bg-[#4a342a] text-[#fcfaf7] font-semibold rounded-lg text-[10px] tracking-wide transition-all uppercase shadow-sm cursor-pointer border border-[#4a342a]/20 shrink-0 font-sans leading-none"
        >
          <Calendar className="w-3.5 h-3.5 text-[#fcfaf7]" />
          <span>{linkText.replace(/📅\s*/g, '')}</span>
        </a>
      );
    } else {
      parts.push(
        <a
          key={`link-${currentKey}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#a68a64] font-bold underline hover:text-[#5c4033] cursor-pointer"
        >
          {linkText}
        </a>
      );
    }
    currentKey++;
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    parts.push(...parseBold(remainingText, currentKey));
  }

  return parts;
}

function parseBold(text: string, baseKey: number): React.ReactNode[] {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let currentKey = baseKey;

  while ((match = boldRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    const [fullMatch, boldText] = match;

    if (matchIndex > lastIndex) {
      parts.push(<span key={currentKey++}>{text.substring(lastIndex, matchIndex)}</span>);
    }

    parts.push(<strong key={currentKey++} className="font-bold text-[#5c4033]">{boldText}</strong>);
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={currentKey++}>{text.substring(lastIndex)}</span>);
  }

  return parts;
}

// Types for baking recipes
interface Recipe {
  id: string;
  name: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  hydration: number; // %
  levain: number; // %
  salt: number; // %
  wholeWheat: number; // %
  ryeOrFlourType: string;
  bulkHours: number;
  bakeTimeMins: number;
  instructions: string[];
}

// Curated Sourdough Recipes in English
const RECIPES_EN: Recipe[] = [
  {
    id: "beginner-loaf",
    name: "Standard Country Wild Loaf (Beginner)",
    description: "The perfect entry point for standard sourdough. Lower hydration makes it highly structured and easy to tension, knead, and score.",
    difficulty: "Beginner",
    hydration: 68,
    levain: 20,
    salt: 2,
    wholeWheat: 10,
    ryeOrFlourType: "Stoneground White Flour",
    bulkHours: 4.5,
    bakeTimeMins: 45,
    instructions: [
      "Autolyse: Combine bread flour, whole wheat flour, and water. Rest for 45 minutes to trigger natural gluten connection.",
      "Inoculate: Add your bubbly active Levain (sourdough starter) and fold it thoroughly into the soft dough. Rest 30 minutes.",
      "Add Salt: Sprinkle salt and 10g of extra water, dimple thoroughly with fingers, then laminate/fold to lock the moisture.",
      "Bulk Fermentation: Perform 4 sets of stretch-and-folds, spaced 30 minutes apart. Then, let the dough rest undisturbed until it increases 40-50% in volume.",
      "Pre-shape: Slip dough onto an unfloured counter. Gently round it into a loose boule. Rest uncover (bench rest) for 20 minutes to form a light skin.",
      "Final Shape: Dust with flour, flip, fold side wings inward, roll tightly from top to bottom into a structured batard or snug boule.",
      "Cold Retard: Transfer to a floured banneton basket, cover, and chill in the refrigerator (3-5°C) for 14-16 hours of slow lactic fermentation.",
      "Baking: Pre-heat your dutch oven at 250°C (482°F) for 1 hour. Invert dough, score a single 45-degree angle slash (the ear!), bake 20 mins with lid on, then 20-25 mins with lid off."
    ]
  },
  {
    id: "tartine-style",
    name: "Artisanal Open-Crumb Sourdough",
    description: "Inspired by traditional high-hydration San Francisco baking. Achieves a gorgeous wild glossy crumb structure and deep dark-caramel blistered blister crust.",
    difficulty: "Intermediate",
    hydration: 76,
    levain: 15,
    salt: 2.1,
    wholeWheat: 15,
    ryeOrFlourType: "Unbleached Bread Flour & Dark Rye Blend",
    bulkHours: 5,
    bakeTimeMins: 45,
    instructions: [
      "Autolyse: Mix flours with water. Rest for 1 hour in a warm area (26°C / 78°F) to ensure absolute hydration.",
      "Add Yeast Culture: Gently smear Levain over dough, use Rubaud knead technique for 5 minutes. Rest 30 minutes.",
      "Add Salt: Distribute fine sea salt with remaining trickle of warm water. Work the dough until silky and soft.",
      "Bulk & Stretch: Fold every 30 minutes for the first 2 hours (4 sets of coil folds). Maintain consistent dough temperature of 25°C.",
      "Fermentation: Let sit undisturbed until light, airy, and dome-shaped with small visible carbon-dioxide surface bubbles.",
      "Shaping: Gently slide dough onto counter. Lightly envelope-fold into a sleek batard under high tension.",
      "Cold Retard: Cold proof in bannetons inside a clean plastic bag for 18 hours at 4°C to fully mature acetic organic acids.",
      "Baking: Turn out onto parchment paper, score with razor blade, bake in roaring hot cast-iron dutch oven (245°C) with two small ice cubes underneath the parchment for high steam expansion."
    ]
  },
  {
    id: "seeded-rye",
    name: "Toasted Seed & Heritage Wheat Levain",
    description: "Packed with soaked toasted pumpkin, sunflower, sesame seeds and dark rye. Incredibly rich crumb aroma with high-density nutrition.",
    difficulty: "Advanced",
    hydration: 74,
    levain: 20,
    salt: 2.2,
    wholeWheat: 20,
    ryeOrFlourType: "Ancient Khorasan & Medium Rye Flour",
    bulkHours: 5.5,
    bakeTimeMins: 50,
    instructions: [
      "Seed Toasting & Soaker: Toast 60g sunflower, 40g pumpkin, 30g sesame seeds. Cool down and soak in 100g warm water for 2 hours. Drain excess water before mixing.",
      "Autolyse: Mix heritage white flour, rye flour, and water. Rest 1 hour.",
      "Mix starter & salt: Work your mature Levain and salt into the autolysed dough. Perform 5 mins slab-and-folds.",
      "Inclusion Lamination: During the first stretch-and-fold, laminate the dough flat on a wet counter and distribute the toasted seeds evenly. Roll back up.",
      "Bulk Fermentation: Rest warm. Run 3 sets of gentle coil folds to maintain matrix structure without tearing the gluten sheets.",
      "Shape & Rest: Shape into a tight round boule. Coat the outer skin with extra raw sesame seeds by rolling on a wet towel then in seeds.",
      "Retard: Chill overnight for 15 hours to complexify yeast-bacteria digestions.",
      "Baking: Bake at 240°C with maximum steam for 25 minutes. Reduce temperature to 210°C, crack open the oven doors slightly, and bake another 25 mins to achieve a heavy nutty crust."
    ]
  },
  {
    id: "sour-brioche",
    name: "Golden Sourdough French Brioche",
    description: "An incredibly decadent, rich, egg-and-butter enriched dough leavened 100% naturally. Soft as a cloud with subtle sourdough character.",
    difficulty: "Advanced",
    hydration: 52,
    levain: 30,
    salt: 1.8,
    wholeWheat: 0,
    ryeOrFlourType: "Sifted Strong T55 French Flour",
    bulkHours: 6,
    bakeTimeMins: 35,
    instructions: [
      "Stiff Levain Feed: Feed starter at a lower hydration (55%) to build dynamic yeast colonies adapted to high sugar/fat habitats.",
      "Initial Mix: Mix bread flour, active levain, chilled sugar, milk, and fresh organic eggs. Knead for 10 mins until smooth.",
      "Butter Infiltration: Gradually incorporate softened unsalted butter (50% of flour weight) one small tablespoon at a time while kneading continuously. This takes around 15 minutes of intensive stand-mixing or hand slaps.",
      "Warm bulk rest: Let bulk rise at 26°C for 4 hours, then transfer to the fridge overnight to fully solidify the butter for easy shaping.",
      "Cold Portioning & Braiding: Divvy dough into 3 equal logs. Braid lightly on a cool worktop and lay into an oiled brioche pan.",
      "Secondary Room Proof: Let rise at room temperature (around 24°C) for 5-7 hours until it fills the loaf pan and shakes like jelly.",
      "Egg Wash: Brush with egg-yolk and raw milk glaze, sprinkle raw pearl sugar over the dome.",
      "Bake: Bake at 180°C (356°F) for 35 minutes until the core reads 90°C. Cool down thoroughly before slicing."
    ]
  }
];

// Curated Sourdough Recipes in Portuguese
const RECIPES_PT: Recipe[] = [
  {
    id: "beginner-loaf",
    name: "Pão Rústico Tradicional (Iniciante)",
    description: "O ponto de partida perfeito para pão rústico clássico de levedura selvagem. Menor hidratação deixa a massa mais firme e fácil de modelar, criar tensão e cortar.",
    difficulty: "Beginner",
    hydration: 68,
    levain: 20,
    salt: 2,
    wholeWheat: 10,
    ryeOrFlourType: "Farinha Branca Moída na Pedra",
    bulkHours: 4.5,
    bakeTimeMins: 45,
    instructions: [
      "Autólise: Misture a farinha branca, farinha integral e água. Deixe descansar por 45 minutos para ativar a rede natural de glúten.",
      "Inoculação: Adicione o seu Levain ativo e borbulhante (fermento natural) e incorpore com cuidado à massa. Descanse por 30 minutos.",
      "Adicionar Sal: Salpique o sal e 10g de água extra, aperte com a ponta dos dedos e dobre a massa para selar a umidade.",
      "Fermentação em Bloco: Faça 4 séries de dobras (stretch-and-fold) a cada 30 minutos. Descanse a massa em temperatura ambiente até crescer de 40-50% em volume.",
      "Pré-modelagem: Despeje a massa na bancada sem farinha. Modele suavemente em formato de bola (boule). Descanse livre por 20 minutos para criar película.",
      "Modelagem Final: Polvilhe farinha, vire a massa, dobre as laterais para dentro e enrole firme de cima para baixo como um batard estruturado.",
      "Fermentação a Frio: Transfira para um cesto de fermentação polvilhado (banneton), cubra e guarde na geladeira (3-5°C) por 14-16 horas de fermentação lenta.",
      "Assar: Pré-aqueça sua panela de ferro a 250°C por 1 hora. Inverta o pão sobre papel, faça um corte rápido em ângulo de 45° (a pestana!) e asse tampado por 20 min, depois destampado por 20-25 min."
    ]
  },
  {
    id: "tartine-style",
    name: "Sourdough de Miolo Aberto Artesanal",
    description: "Inspirado no estilo consagrado de alta hidratação de San Francisco. Desenvolve um miolo selvagem brilhoso e uma casca intensamente dourada e caramelizada.",
    difficulty: "Intermediate",
    hydration: 76,
    levain: 15,
    salt: 2.1,
    wholeWheat: 15,
    ryeOrFlourType: "Farinha de Pão Premium e Mescla Centeio Escuro",
    bulkHours: 5,
    bakeTimeMins: 45,
    instructions: [
      "Autólise: Misture as farinhas com a água. Deixe descansar por 1 hora em local morno (26°C) para garantir a hidratação completa.",
      "Inoculação: Espalhe delicadamente o fermento pela massa utilizando a técnica Rubaud por 5 minutos. Descanse por 30 minutos.",
      "Adicionar Sal: Distribua sal marinho fino com o restante da água morna. Trabalhe a massa até ficar sedosa e macia.",
      "Dobras e Trabalho: Faça dobras a cada 30 minutos nas primeiras 2 horas (4 dobras tipo coil fold). Mantenha a temperatura da massa a 25°C.",
      "Fermentação: Deixe descansar sem mexer até que fique leve, aerada e em formato de domo, com bolhas visíveis de gás carbônico na superfície.",
      "Modelagem: Deslize a massa levemente na bancada. Dobre em formato de envelope formando um batard elegante sob alta tensão.",
      "Fermentação a Frio: Coloque no banneton dentro de um saco plástico limpo por 18 horas a 4°C para amadurecer os ácidos orgânicos.",
      "Assar: Inverta sobre papel manteiga, faça cortes rápidos e asse em panela de ferro superaquecida (245°C) com cubos de gelo sob o papel para máximo vapor."
    ]
  },
  {
    id: "seeded-rye",
    name: "Trigo Heritage Sourdough com Sementes Tostadas",
    description: "Sementes de abóbora, girassol e gergelim tostadas incorporadas em massa de trigo antigo e centeio médio. Sabor rústico riquíssimo com alto valor nutricional.",
    difficulty: "Advanced",
    hydration: 74,
    levain: 20,
    salt: 2.2,
    wholeWheat: 20,
    ryeOrFlourType: "Farinha de Trigo Khorasan e Centeio Médio",
    bulkHours: 5.5,
    bakeTimeMins: 50,
    instructions: [
      "Tostagem e Hidratação: Toste 60g de girassol, 40g de abóbora e 30g de gergelim. Esfrie e hidrate com 100g de água morna por 2 horas. Escorra o excesso antes de misturar.",
      "Autólise: Misture as farinhas rústicas com a água. Descanse por 1 hora.",
      "Misturar fermento e sal: Adicione o seu Levain maduro e sal à massa autolisada. Sove com dobras por 5 minutos.",
      "Laminação e Inclusões: Na primeira dobra, abra a massa bem fina na bancada úmida e distribua as sementes tostadas uniformemente. Enrole de volta.",
      "Fermentação em Bloco: Deixe fermentar morno. Faça 3 séries de dobras coil folds suaves para manter a estrutura sem rasgar o glúten.",
      "Modelagem e Descanso: Modele em uma bola firme. Passe a superfície externa em um pano úmido e depois role em sementes de gergelim cruas.",
      "Crescimento a Frio: Refrigere por 15 horas para intensificar as digestões simbióticas de levedura e bactérias.",
      "Assar: Asse a 240°C com máximo vapor por 25 minutos. Reduza a 210°C, abra um pouco a porta do forno e deixe mais 25 minutos para dourar bem."
    ]
  },
  {
    id: "sour-brioche",
    name: "Brioche Francês de Sourdough Dourado",
    description: "Uma receita extremamente rica e decadente com ovos e manteiga fresca, fermentada de forma 100% natural. Incrivelmente macio com toque sutil de acidez.",
    difficulty: "Advanced",
    hydration: 52,
    levain: 30,
    salt: 1.8,
    wholeWheat: 0,
    ryeOrFlourType: "Farinha Francesa Forte Saborizada T55",
    bulkHours: 6,
    bakeTimeMins: 35,
    instructions: [
      "Levain Duro: Alimente o fermento a 55% de hidratação para criar colônias de leveduras adaptadas a ambientes ricos em açúcar e gordura.",
      "Mistura Inicial: Misture farinha de panificação, levain ativo, açúcar, leite morno e ovos orgânicos frescos. Sove por 10 minutos.",
      "Infiltração de Manteiga: Adicione manteiga sem sal amolecida (50% do peso da farinha) aos poucos, uma colherada de cada vez, sovando constantemente (15 minutos).",
      "Fermentação Inicial: Deixe descansar a 26°C por 4 horas e transfira para a geladeira para endurecer a manteiga e facilitar a modelagem.",
      "Porções e Trança: Divida em 3 cilindros iguais. Trance suavemente na bancada fria e coloque em uma forma untada de brioche/pão.",
      "Segunda Fermentação: Deixe crescer em temperatura ambiente (24°C) de 5 a 7 horas até dobrar de tamanho e chacoalhar como gelatina.",
      "Pincelar e Cobertura: Pincele com gema e leite fresco e salpique açúcar gema cristalizado por cima.",
      "Assar: Asse a 180°C por 35 minutos até que o centro chegue a 90°C. Deixe esfriar completamente antes de cortar."
    ]
  }
];

// Curated Sourdough Recipes in Spanish
const RECIPES_ES: Recipe[] = [
  {
    id: "beginner-loaf",
    name: "Pan Rústico Tradicional (Principiante)",
    description: "El punto de partida perfecto para el clásico pan rústico de levadura salvaje. Una menor hidratación hace que la masa sea más firme y fácil de amasar, crear tensión y cortar.",
    difficulty: "Beginner",
    hydration: 68,
    levain: 20,
    salt: 2,
    wholeWheat: 10,
    ryeOrFlourType: "Harina Blanca Molida en Piedra",
    bulkHours: 4.5,
    bakeTimeMins: 45,
    instructions: [
      "Autólisis: Mezcle la harina blanca, la harina integral y el agua. Deje reposar por 45 minutos para activar la red natural de gluten.",
      "Inoculación: Añada su masa madre activa y burbujeante (levain) e incorpórela con cuidado a la masa. Deje reposar por 30 minutos.",
      "Añadir Sal: Espolvoree la sal y 10g de agua extra, apriete con la punta de los dedos y doble la masa para sellar la humedad.",
      "Fermentación en Bloque: Realice 4 series de pliegues (stretch-and-fold) cada 30 minutos. Deje reposar la masa a temperatura ambiente hasta que crezca entre un 40-50% en volumen.",
      "Preformado: Vuelque la masa sobre la superficie de trabajo sin harina. Forme suavemente una bola suelta (boule). Deje reposar al aire por 20 minutos para que cree una ligera película o piel.",
      "Formado Final: Espolvoree harina, voltee la masa, doble los lados hacia el centro y enrolle firmemente de arriba a abajo como un batard estructurado o boule ajustado.",
      "Segunda Fermentación (Retardo en Frío): Transfiera a un cesto de fermentación enharinado (banneton), cubra y guarde en el refrigerador (3-5°C) durante 14-16 horas para una fermentación láctica lenta.",
      "Horneado: Precaliente su olla holandesa (dutch oven) a 250°C durante 1 hora. Invierta la hogaza sobre papel para hornear, realice un corte rápido en un ángulo de 45° (¡la greña!) y hornee tapado durante 20 minutos, y luego destapado durante 20-25 minutos."
    ]
  },
  {
    id: "tartine-style",
    name: "Sourdough de Alveolado Abierto Artesanal",
    description: "Inspirado en el tradicional método de alta hidratación de San Francisco. Desarrolla un alveolado salvaje y brillante, y una corteza profundamente caramelizada y crujiente.",
    difficulty: "Intermediate",
    hydration: 76,
    levain: 15,
    salt: 2.1,
    wholeWheat: 15,
    ryeOrFlourType: "Harina de Fuerza Premium y Mezcla de Centeno Oscuro",
    bulkHours: 5,
    bakeTimeMins: 45,
    instructions: [
      "Autólisis: Mezcle las harinas con el agua. Deje reposar por 1 hora en un lugar cálido (26°C) para garantizar una hidratación completa.",
      "Inoculación: Frote delicadamente el prefermento por la masa utilizando la técnica Rubaud durante 5 minutos. Deje reposar por 30 minutos.",
      "Añadir Sal: Distribuya sal marina fina con el resto del agua tibia. Trabaje la masa hasta que quede sedosa y blanda.",
      "Pliegues y Trabajo: Realice pliegues cada 30 minutos durante las primeras 2 horas (4 series de coil folds). Mantenga la temperatura de la masa a 25°C.",
      "Fermentación: Deje reposar sin tocar hasta que la masa quede ligera, aireada y en forma de domo, con pequeñas burbujas de dióxido de carbono visibles en la superficie.",
      "Formado: Deslice la masa suavemente sobre la superficie. Doble en forma de sobre formando un elegante batard de alta tensión.",
      "Fermentación en Frío: Coloque en bannetons dentro de una bolsa de plástico limpia por 18 horas a 4°C para madurar completamente los ácidos orgánicos.",
      "Horneado: Voltee sobre papel para hornear, realice cortes rápidos con cuchilla y hornee en olla de hierro fundido muy caliente (245°C) con dos cubitos de hielo bajo el papel para obtener máximo vapor."
    ]
  },
  {
    id: "seeded-rye",
    name: "Trigo Heritage Sourdough con Semillas Tostadas",
    description: "Semillas de calabaza, girasol y sésamo tostadas e hidratadas, incorporadas en una masa de trigo antiguo y centeno. Un aroma rústico riquísimo con un gran valor nutricional.",
    difficulty: "Advanced",
    hydration: 74,
    levain: 20,
    salt: 2.2,
    wholeWheat: 20,
    ryeOrFlourType: "Harina de Trigo Khorasan y Centeno Medio",
    bulkHours: 5.5,
    bakeTimeMins: 50,
    instructions: [
      "Tostado e Hidratación: Tueste 60g de girasol, 40g de calabaza y 30g de sésamo. Deje enfriar e hidrate con 100g de agua tibia por 2 horas. Escurra el exceso antes de mezclar.",
      "Autólisis: Mezcle las harinas rústicas con el agua. Repose por 1 hora.",
      "Mezclar prefermento y sal: Añada su levain maduro y la sal a la masa autolizada. Amase con pliegues por 5 minutos.",
      "Laminación e Inclusiones: En el primer pliegue, estire la masa fina en la superficie húmeda y distribuya las semillas tostadas uniformemente. Enrolle de vuelta.",
      "Fermentación en Bloque: Deje fermentar en un lugar templado. Realice 3 series de coil folds suaves para mantener la estructura sin romper el gluten.",
      "Formado y Reposo: Forme una bola firme. Pase la superficie externa por un paño húmedo y luego ruede en sementes de sésamo crudas.",
      "Crecimiento en Frío: Refrigere por 15 horas para intensificar las digestiones simbióticas de levaduras y bacterias.",
      "Horneado: Hornee a 240°C con máximo vapor durante 25 minutos. Reduzca la temperatura a 210°C, abra ligeramente la puerta del horno y deje otros 25 minutos para dorar."
    ]
  },
  {
    id: "sour-brioche",
    name: "Golden Sourdough French Brioche",
    description: "Una receta de brioche francés extremadamente rica y enriquecida con huevo y mantequilla fresca, fermentada de forma 100% natural. Suave como una nube con un toque sutil de acidez.",
    difficulty: "Advanced",
    hydration: 52,
    levain: 30,
    salt: 1.8,
    wholeWheat: 0,
    ryeOrFlourType: "Harina Francesa Fuerte Saborizada T55",
    bulkHours: 6,
    bakeTimeMins: 35,
    instructions: [
      "Levain Duro: Alimente el prefermento al 55% de hidratación para crear colonias de levaduras adaptadas a entornos de alta azúcar y grasa.",
      "Mezcla Inicial: Mezcle harina de fuerza, levain activo, azúcar, leche tibia y huevos orgánicos frescos. Amase por 10 minutos hasta que esté suave.",
      "Infiltración de Mantequilla: Incorpore la mantequilla sin sal ablandada (50% del peso de la harina) poco a poco, una cucharada a la vez, amasando constantemente (15 minutos).",
      "Fermentación Inicial: Deje descansar a 26°C por 4 horas y luego transfiera a la nevera para endurecer la mantequilla y facilitar el formado.",
      "Porciones y Trenzado: Divida en 3 cilindros iguales. Trence suavemente en la superficie fría y coloque en un molde untado de brioche/pan.",
      "Segunda Fermentación: Deje crecer a temperatura ambiente (24°C) de 5 a 7 horas hasta duplicar su tamaño y chacoalhar como gelatina.",
      "Pincelar y Cobertura: Pincele con yema y leche fresca, disperse azúcar perlado por encima de la cúpula.",
      "Horneado: Hornee a 180°C durante 35 minutos hasta que el centro marque 90°C. Deje enfriar por completo antes de rebanar."
    ]
  }
];

const TRANSLATIONS = {
  en: {
    appName: "Levain & Life",
    appSub: "Beginner Hub",
    appDesc: "Your Guide to Long & Natural Sourdough Fermentation",
    tabStarter: "Starter Lab",
    tabCalculator: "Ratio Helper",
    tabRecipes: "Heritage Recipes",
    tabTimeline: "Companion",
    tabAssistant: "Bake Mentor",
    
    // TAB 1
    starterHeading: "Birthing Your Wild Yeast Culture",
    starterJourney: "Initiation Journey",
    starterWild: "Wild Culturing",
    starterSub: "Unlike industrial bakers who use isolated single strains of packet yeast, sourdough baking relies on a rich, symbiotic culture of Saccharomyces exiguus (wild yeast) and Lactobacillus sanfranciscensis (lactic bacteria). These thrive naturally on the grain hulls of premium stoneground flours.",
    milestoneTitle: "Day 1-7 Starter Growth Milestones",
    milestoneDays: [
      {
        title: "Days 1 & 2: Organic Hydration",
        desc: "Mix 50g whole rye flour with 50g water (28°C / 82°F) in a high-sided glass jar. Cover loosely. Some small bubbles form on Day 2, usually caused by leuconostoc bacteria—this is not true sourdough yeast activity yet!"
      },
      {
        title: "Days 3 & 4: Acidification Phase",
        desc: "Acids build up. Yeast strains from hulls start thriving as bacteria lower the pH level. Discard all but 50g starter, feed with 50g unbleached wheat flour and 50g room-temperature water. Smells slightly like old fruit."
      },
      {
        title: "Days 5 & 6: Symbiotic Balancing",
        desc: "Rise begins to happen predictably 6 to 9 hours after feed. Fruity aroma transitions into elegant crisp alcohol notes. Keep up the ratio feeds every 24 hours."
      },
      {
        title: "Day 7+: Mature Activity & Baking Ready",
        desc: "The starter expands to double or triple its height 4 to 6 hours after feeding. It has a robust, clean sourdough tang. You are officially ready to inoculate dough!"
      }
    ],
    masterTipTitle: "💡 Sourdough Master Tip: The Float Test",
    masterTipDesc: "Drop a teaspoon of your peaked levain gently into cold water. If it floats on top, it holds enough carbon gas bubbles—it's mature and fully ready for structural baking!",
    
    // TAB 1 simulator
    activePhase: "Active Phase",
    birthStarter: "The Birth of Your Starter",
    simulatorSub: "Understand how ambient kitchen factors alter your yeast culture's life cycle. Set variables to discover peak fermentation windows!",
    glassTriple: "- Triple",
    glassDouble: "- Double (Peak)",
    glassFeed: "- Feed Line 1x",
    bakeActive: "BAKE WINDOW ACTIVE",
    hoursFedLabel: "Hours Since Feeding:",
    kitchenTempLabel: "Kitchen Temp:",
    feedRatioLabel: "Feeding Ratio:",
    cultureAgeLabel: "Culture Age:",
    currentPhaseLabel: "Current Phase",
    expectedPeakLabel: "Expected Peak Hour",
    aromaLabel: "Sensory Aroma Notes",
    acidityLabel: "Acidity Level",
    masterAdviceLabel: "Master Advice:",
    calculateFlourCTA: "Step 2: Calculate Flour & Baker Percentages",

    // TAB 2 Calculator
    calcHeading: "Baker's Percentages & Scale Calculator",
    calcSub: "Bakers define everything in relation to flour weight (100%). Leverage this math to scale your baking perfectly to the exact grams!",
    desiredFlourLabel: "Desired Dry Flour Weight:",
    yieldLabel: "Yield:",
    goodFor: "good for about",
    standardBoules: "standard round organic boules",
    waterHydrationLabel: "Water Hydration Percentage:",
    levainPctLabel: "Levain inoculate ratio (% of flour weight):",
    levainPctSub: "Higher percentage accelerates bulk rise but yields slightly faster sour taste saturation.",
    saltPctLabel: "Salt percentage (% of flour weight):",
    saltPctSub: "Essential for structural gluten protein bonding. Standard artisanal target is 2.0%.",
    localRoomTempLabel: "Local Room Temperature:",
    stiff: "(Stiff)",
    ciabattaStyle: "(Ciabatta style)",
    beginnerHydrationText: "Beginner: Low sticky tension",
    intermediateHydrationText: "Intermediate: Country open crumbs",
    advancedHydrationText: "Advanced: Sticky, high-sheen crust",
    receiptTitle: "Artisanal Formula Bill",
    receiptSub: "Your Dynamic Ingredient Ratios",
    breadFlourWeightLabel: "Bread Flour Weight",
    breadFlourWeightDesc: "Unbleached High-Protein Type (100%)",
    purifiedWaterWeightLabel: "Purified Water Weight",
    purifiedWaterWeightDesc: "Target Hydration Ratio",
    activeMatureLevainLabel: "Active Mature Levain",
    activeMatureLevainDesc: "Fed 1:1:1",
    fineSeaSaltLabel: "Fine Sea Salt",
    fineSeaSaltDesc: "Fine Sea Salt crystals",
    waterTempGuidanceTitle: "Water Temperature Guidance",
    waterTempGuidanceDesc: "To hit the target bulk fermentation temperature of 25°C - 26°C, your ingredient water should be mixed at:",
    formulaLabel: "Formula:",
    totalDoughWeightLabel: "Total Dough Weight:",
    applyFormulaCTA: "Apply Custom Formula to Active Timeline Companion",

    // TAB 3 Recipes
    archiveHeading: "Artisanal Sourdough Archives",
    archiveTitle: "Classic Natural Wild-Yeasted Ratios",
    archiveSub: "Natural fermentation recipes, or 'receipt' guidelines as written historically, rely on ambient microclimate and proper grain hydration.",
    viewSteps: "View Steps",
    grainBlend: "Grain blend",
    wheatLabel: "Whole Wheat",
    recipeInstructionsTitle: "Step-by-Step Directions:",
    recipeInstructionsSub: "Read directions and apply them directly to your session companion tracker timeline.",
    loadIntoCompanionCTA: "Load into Active Companion Tracker",

    // TAB 4 Timeline Companion
    timelineHeading: "Live Companion",
    timelineTitle: "Fermentation Active Timeline",
    timelineSub: "Click each checkpoint below during your actual baking session to verify steps, track fermentation durations, and log your progress.",
    stepLabel: "Step",
    activeStepFocus: "Active Step Focus",
    timerLabel: "Stretch & Fold Timer",
    cycleLabel: "30m Cycle",
    timerSub: "Recommended resting window between gluten folds.",
    pauseBtn: "Pause",
    startTimerBtn: "Start Timer",
    skipBtn: "Skip",
    perfectDoughLabel: "Perfect Dough Progress Checkmarks:",
    checklist1: "Elastic gluten strands that stretch without tearing easily",
    checklist2: "Light carbon gas bubbles forming on outer dough dome",
    checklist3: "Puffy, light volume weight when lifted from tub",
    didYouKnowTitle: "Did you know?",
    didYouKnowDesc: "Natural sourdough has a glycemic index of around 54 (compared to over 71 for white baker envelope loaf). The long fermentation structure slows down starch break, aiding organic index insulin reactions!",

    // TAB 5 Assistant
    assistantHeading: "Sourdough Assistant Mentorship",
    activeBakerStatus: "Gemini AI Baker Active",
    clearConversation: "Clear chat",
    placeholderUser: "You (Beginner)",
    placeholderMaster: "Sourdough Master",
    inputPlaceholder: "Ask Master: 'My loaf came out flat and dense...', 'What does autolyse do?'",
    uploadButton: "Attach Photo of Your Sourdough/Bake",
    dragAndDropPrompt: "Drop your photo here to attach!",
    imageAttached: "Image attached",
    beginnerFaqTitle: "Beginner FAQs (Tap to Ask)",
    beginnerFaqSub: "Tap any common sourdough pitfall below to immediately ask the Master for organic baking troubleshooting remedies:",
    faq1: "👃 STARTER smells like acetone?",
    faq2: "🍞 Why didn't my bread get an 'ear'?",
    faq3: "💦 Dough shape is a puddle?",
    faq4: "⚠️ Underproofed vs Overproofed?",
    faq5: "🌾 Best flour for robust levain?",

    footerQuote: "“Wild yeasts ask for neither haste nor praise, only flour, water, and warm patience.”",
    footerCopyright: "Natural Levain Companion Hub • Long Natural Fermentation Craft",
    hours: "hours",
    around: "Around"
  },
  pt: {
    appName: "Levain & Vida",
    appSub: "Hub de Iniciantes",
    appDesc: "Seu Guia para Fermentação Natural e Longa de Pães Sourdough",
    tabStarter: "Lab de Fermento",
    tabCalculator: "Calculadora",
    tabRecipes: "Receitas Rústicas",
    tabTimeline: "Cronograma Ativo",
    tabAssistant: "Mentor de Panificação",

    // TAB 1
    starterHeading: "Dando Vida ao seu Fermento Selvagem",
    starterJourney: "Jornada de Iniciação",
    starterWild: "Cultivo Selvagem",
    starterSub: "Diferente de padeiros industriais que usam sementes isoladas de levedura comercial em pó, a panificação com sourdough apoia-se em uma cultura simbiótica de Saccharomyces exiguus (levedura selvagem) e Lactobacillus sanfranciscensis (bactéria lática). Elas vivem naturalmente nas cascas de farinhas integrais moídas na pedra.",
    milestoneTitle: "Marcos de Crescimento do Fermento (Dias 1 a 7)",
    milestoneDays: [
      {
        title: "Dias 1 & 2: Hidratação Orgânica",
        desc: "Misture 50g de farinha de centeio integral com 50g de água morna (28°C) em um pote de vidro de laterais altas. Cubra de forma frouxa. Algumas bolhas surgirão no Dia 2, causadas por bactérias do gênero Leuconostoc — ainda não é fermento ativo!"
      },
      {
        title: "Dias 3 & 4: Fase de Acidificação",
        desc: "Os ácidos se desenvolvem. Linhagens de levedura selvagem começam a colonizar enquanto as bactérias saudáveis acidificam e baixam o pH do meio. Descarte todo o conteúdo do pote, exceto 50g, alimente com 50g de farinha branca de trigo de panificação e 50g de água. Aroma leve de fruta madura."
      },
      {
        title: "Dias 5 & 6: Equilíbrio Simbiótico",
        desc: "O crescimento começa a ser previsível de 6 a 9 horas após a alimentação. O aroma de frutas dá lugar a notas limpas de álcool e fermentado benéfico do centeio. Continue alimentando a massa de 24 em 24 horas."
      },
      {
        title: "Dia 7+: Atividade Madura & Pronto para Assar",
        desc: "O fermento cresce até dobrar ou triplicar de tamanho cerca de 4 a 6 horas após ser alimentado. Apresenta o sabor aveludado e azedinho característico. Você está oficialmente apto a inoculá-lo na sua primeira receita!"
      }
    ],
    masterTipTitle: "💡 Dica do Mestre: O Teste de Flutuar",
    masterTipDesc: "Coloque uma colher do seu levain ativo em um copo com água morna ou fria. Se flutuar de forma leve na superfície, significa que desenvolveu e prendeu gases suficientes — está maduro e pronto para estruturar o seu pão!",

    // TAB 1 simulator
    activePhase: "Fase Ativa",
    birthStarter: "O Ciclo do seu Fermento",
    simulatorSub: "Monitore como fatores do ambiente da sua cozinha regulam o ciclo biológico do fermento natural. Varie os seletores para encontrar as janelas ideais!",
    glassTriple: "- Triplicado",
    glassDouble: "- Dobrado (Pico)",
    glassFeed: "- Linha Base 1x",
    bakeActive: "FERMENTO NO PICO PARA ASSAR",
    hoursFedLabel: "Horas desde a Alimentação:",
    kitchenTempLabel: "Temp. da Cozinha:",
    feedRatioLabel: "Proporção de Alimentação:",
    cultureAgeLabel: "Idade do Cultivo:",
    currentPhaseLabel: "Fase Atual",
    expectedPeakLabel: "Hora do Pico Previsto",
    aromaLabel: "Aroma e Aspecto",
    acidityLabel: "Nível de Acidez",
    masterAdviceLabel: "Conselho do Mestre:",
    calculateFlourCTA: "Etapa 2: Calcular Farinhas e Proporções",

    // TAB 2 Calculator
    calcHeading: "Porcentagens de Padeiro e Calculadora de Escala",
    calcSub: "Padeiros artesanais calculam cada ingrediente com base no peso total de farinha seca (100%). Use este método para produzir massas consistentes!",
    desiredFlourLabel: "Peso Desejado de Farinha Seca:",
    yieldLabel: "Rendimento Estimado:",
    goodFor: "suficiente para cerca de",
    standardBoules: "pães redondos (boules) rústicos de tamanho padrão",
    waterHydrationLabel: "Porcentagem de Hidratação de Água:",
    levainPctLabel: "Quantidade de Levain (% em relação à farinha):",
    levainPctSub: "Valores maiores aceleram a fermentação em bloco primária, mas trazem notas acentuadas de acidez láctica mais rapidamente.",
    saltPctLabel: "Quantidade de Sal (% em relação à farinha):",
    saltPctSub: "Melhora a rede de glúten, a força tensora e o sabor. O padrão ideal para pães rústicos é 2.0%.",
    localRoomTempLabel: "Temperatura Local da Cozinha:",
    stiff: "(Massa firme)",
    ciabattaStyle: "(Tipo ciabatta fluido)",
    beginnerHydrationText: "Iniciante: massa firme e fácil modelagem",
    intermediateHydrationText: "Intermediário: miolo rústico levemente aberto",
    advancedHydrationText: "Avançado: massa fluida de alta captação de umidade",
    receiptTitle: "Ficha da Fórmula Artesanal",
    receiptSub: "Suas Proporções e Ingredientes Dinâmicos",
    breadFlourWeightLabel: "Peso da Farinha de Trigo",
    breadFlourWeightDesc: "Farinha branca de alta proteína (100%)",
    purifiedWaterWeightLabel: "Peso da Água Filtrada",
    purifiedWaterWeightDesc: "Hidratação de Água Alvo",
    activeMatureLevainLabel: "Fermento Levain Ativo",
    activeMatureLevainDesc: "Alimentado na proporção 1:1:1",
    fineSeaSaltLabel: "Sal Marinho Fino",
    fineSeaSaltDesc: "Sal de panificação artesanal",
    waterTempGuidanceTitle: "Temperatura de Água Aconselhada",
    waterTempGuidanceDesc: "Para atingir a faixa ideal de fermentação de 25°C - 26°C, misture a água com a seguinte temperatura aproximada:",
    formulaLabel: "Fórmula:",
    totalDoughWeightLabel: "Peso Total da Massa:",
    applyFormulaCTA: "Aplicar esta Fórmula ao Guia de Cronograma Ativo",

    // TAB 3 Recipes
    archiveHeading: "Caderno Rústico de Panificação",
    archiveTitle: "Relações Clássicas de Fermento Selvagem",
    archiveSub: "Receitas de fermentação lenta elaboradas de acordo com as proporções mais famosas do mundo da panificação.",
    viewSteps: "Ver Etapas",
    grainBlend: "Mistura de grãos",
    wheatLabel: "Trigo Integral",
    recipeInstructionsTitle: "Instruções Passo a Passo:",
    recipeInstructionsSub: "Veja os procedimentos originais e carregue-os direto em seu cronograma interativo de hoje.",
    loadIntoCompanionCTA: "Carregar no Cronograma de Fermentação Ativo",

    // TAB 4 Timeline Companion
    timelineHeading: "Acompanhamento Ativo",
    timelineTitle: "Roteiro Digital de Fermentação",
    timelineSub: "Marque cada etapa conforme melhora a textura do pão. Use o temporizador para controlar os intervalos recomendados de dobras.",
    stepLabel: "Etapa",
    activeStepFocus: "Foco na Etapa Ativa",
    timerLabel: "Cronômetro de Dobras (Stretch & Fold)",
    cycleLabel: "Ciclo de 30 minutos",
    timerSub: "Janela sugerida para descanso do glúten entre dobras suaves da massa.",
    pauseBtn: "Pausar",
    startTimerBtn: "Iniciar",
    skipBtn: "Pular",
    perfectDoughLabel: "Indicadores Visuais de Glúten Perfeito:",
    checklist1: "Rede de glúten elástica que estica sem rasgar facilmente (teste de janela)",
    checklist2: "Bolhas delicadas de gás se formando sob o domo superior de massa",
    checklist3: "Massa leve e expandida ao toque antes de despejar no balcão",
    didYouKnowTitle: "Você Sabia?",
    didYouKnowDesc: "O pão sourdough de fermentação natural de longo prazo tem índice glicêmico de cerca de 54 (oposto a mais de 71 de pães industriais). As bactérias láticas retardam a quebra de amido, auxiliando a resposta insulínica!",

    // TAB 5 Assistant
    assistantHeading: "Mentoria de Fermento Natural",
    activeBakerStatus: "Inteligência Artificial Ativa",
    clearConversation: "Limpar Chat",
    placeholderUser: "Você (Iniciante)",
    placeholderMaster: "Mestre Sourdough",
    inputPlaceholder: "Pergunte ao Mestre: 'Meu pão saiu achatado e pesado...', 'Para que serve a autólise?'",
    uploadButton: "Anexar foto da sua produção/levain",
    dragAndDropPrompt: "Solte sua foto aqui para anexar!",
    imageAttached: "Imagem anexada",
    beginnerFaqTitle: "Perguntas Frequentes de Padeiros",
    beginnerFaqSub: "Clique em uma das dúvidas mais comuns abaixo para receber as dicas de correção do Mestre na hora:",
    faq1: "👃 MEU FERMENTO cheira a acetona?",
    faq2: "🍞 Como fazer o pão criar uma 'pestana' bonita?",
    faq3: "💦 A massa está grudenta e mole demais?",
    faq4: "⚠️ Diferença entre Superfermentado e Subfermentado?",
    faq5: "🌾 Qual melhor farinha para alimentar o levain?",

    footerQuote: "“Leveduras selvagens não pedem pressa nem louvor, apenas farinha, água e paciência morna.”",
    footerCopyright: "Hub do Padeiro Companheiro de Fermento Natural • Técnicas Tradicionais",
    hours: "horas",
    around: "Aproximadamente"
  },
  es: {
    appName: "Levain & Vida",
    appSub: "Iniciación",
    appDesc: "Tu Guía para la Fermentación Lenta y Natural de Pan con Masa Madre",
    tabStarter: "Lab de Masa Madre",
    tabCalculator: "Calculadora",
    tabRecipes: "Recetas Ancestrales",
    tabTimeline: "Cronograma Activo",
    tabAssistant: "Mentor de Panadería",
    
    // TAB 1
    starterHeading: "Dando Vida a tu Cultivo de Levadura Salvaje",
    starterJourney: "Jornada de Iniciación",
    starterWild: "Cultivo Silvestre",
    starterSub: "A diferencia de los panaderos industriales que utilizan levadura comercial en sobre, la panificación con masa madre se basa en un cultivo simbiótico de Saccharomyces exiguus (levadura salvaje) y Lactobacillus sanfranciscensis (bacteria láctica), que prosperan de forma natural en el salvado de harinas de grano entero molidas en piedra.",
    milestoneTitle: "Hitos del Crecimiento de la Masa Madre (Días 1 a 7)",
    milestoneDays: [
      {
        title: "Días 1 y 2: Hidratación Orgánica",
        desc: "Mezcle 50g de harina de centeno integral con 50g de agua tibia (28°C) en un frasco de vidrio alto. Cubra ligeramente. Aparecerán algunas burbujas el Día 2, provocadas por la bacteria Leuconostoc; ¡aún no es fermentación de levadura real!"
      },
      {
        title: "Días 3 y 4: Fase de Acidificación",
        desc: "Se acumulan los ácidos. Las levaduras de las cáscaras prosperan cuando las bacterias disminuyen el pH. Descarte todo menos 50g de masa madre, alimente con 50g de harina blanca de trigo de fuerza y 50g de agua templada. Huele un poco a fruta madura."
      },
      {
        title: "Días 5 y 6: Equilibrio Simbiótico",
        desc: "El crecimiento comienza a ocurrir de manera predecible entre 6 y 9 horas después de alimentar. El aroma a fruta se convierte en notas limpias de alcohol. Continúe con las alimentaciones diarias cada 24 horas."
      },
      {
        title: "Dia 7+: Actividad Madura y Lista para Hornear",
        desc: "La masa madre duplica o triplica su volumen de 4 a 6 horas después de alimentarla. Desarrolla un aroma robusto, limpio y ácido. ¡Está oficialmente lista para inocular la masa y hornear!"
      }
    ],
    masterTipTitle: "💡 Consejo del Maestro: La Prueba de Flotación",
    masterTipDesc: "Deje caer una cucharadita de su levain en su punto máximo en un vaso de agua fría. Si flota, significa que retiene suficientes burbujas de gas carbónico y está maduro y listo para estructurar su pan.",
    
    // TAB 1 simulator
    activePhase: "Fase Activa",
    birthStarter: "El Ciclo de tu Masa Madre",
    simulatorSub: "Monitorea cómo la temperatura ambiente y otros factores regulan el ciclo de vida de tu fermento natural. ¡Ajusta los controles para descubrir el punto óptimo!",
    glassTriple: "- Triplicado",
    glassDouble: "- Duplicado (Pico)",
    glassFeed: "- Línea Base 1x",
    bakeActive: "FERMENTO EN EL PICO PARA HORNEAR",
    hoursFedLabel: "Horas desde la Alimentación:",
    kitchenTempLabel: "Temp. de la Cocina:",
    feedRatioLabel: "Proporción de Alimentación:",
    cultureAgeLabel: "Edad del Cultivo:",
    currentPhaseLabel: "Fase Actual",
    expectedPeakLabel: "Hora de Pico Previsto",
    aromaLabel: "Aroma y Aspecto",
    acidityLabel: "Nivel de Acidez",
    masterAdviceLabel: "Consejo del Maestro:",
    calculateFlourCTA: "Paso 2: Calcular Harinas y Proporciones",

    // TAB 2 Calculator
    calcHeading: "Porcentajes del Panadero y Calculadora de Escala",
    calcSub: "Los panaderos definen cada ingrediente en relación con el peso de la harina seca (100%). ¡Utiliza este cálculo preciso para escalar tu masa de forma consistente!",
    desiredFlourLabel: "Peso Deseado de Harina Seca:",
    yieldLabel: "Rendimiento Estimado:",
    goodFor: "suficiente para cerca de",
    standardBoules: "hogazas redondas (boules) rústicas de tamaño estándar",
    waterHydrationLabel: "Porcentaje de Hidratación de Agua:",
    levainPctLabel: "Proporción de Masa Madre (% con respecto a la harina):",
    levainPctSub: "Un porcentaje mayor acelera la fermentación en bloque inicial, pero aporta acidez láctica más rápidamente.",
    saltPctLabel: "Porcentaje de Sal (% con respecto a la harina):",
    saltPctSub: "Esencial para el desarrollo de la red de gluten. El estándar para pan rústico artesanal es del 2.0%.",
    localRoomTempLabel: "Temperatura Ambiente de la Cocina:",
    stiff: "(Masa firme)",
    ciabattaStyle: "(Estilo ciabatta fluido)",
    beginnerHydrationText: "Principiante: masa firme y fácil formado",
    intermediateHydrationText: "Intermedio: alveolado rústico moderadamente abierto",
    advancedHydrationText: "Avanzado: masa húmeda con gran retención de gas",
    receiptTitle: "Ficha de la Fórmula Artesanal",
    receiptSub: "Tus Ingredientes y Proporciones Dinámicas",
    breadFlourWeightLabel: "Peso de la Harina de Trigo",
    breadFlourWeightDesc: "Harina blanca de alta proteína (100%)",
    purifiedWaterWeightLabel: "Peso del Agua Filtrada",
    purifiedWaterWeightDesc: "Hidratación de Agua Objetivo",
    activeMatureLevainLabel: "Masa Madre Activa y Madura",
    activeMatureLevainDesc: "Alimentada en proporción 1:1:1",
    fineSeaSaltLabel: "Sal Marina Fina",
    fineSeaSaltDesc: "Sal fina de panadería artesanal",
    waterTempGuidanceTitle: "Temperatura de Agua Recomendada",
    waterTempGuidanceDesc: "Para alcanzar la temperatura óptima de fermentación de 25°C - 26°C, el agua de amasado debe estar a:",
    formulaLabel: "Fórmula:",
    totalDoughWeightLabel: "Peso Total de la Masa:",
    applyFormulaCTA: "Aplicar Fórmula al Cronograma de Fermentación Activa",

    // TAB 3 Recipes
    archiveHeading: "Archivo Rústico de Panificación",
    archiveTitle: "Fórmulas Clásicas de Masa Madre Natural",
    archiveSub: "Recetas tradicionales de fermentación lenta adaptadas a las proporciones más célebres de la panadería artesanal.",
    viewSteps: "Ver Pasos",
    grainBlend: "Mezcla de granos",
    wheatLabel: "Trigo Integral",
    recipeInstructionsTitle: "Instrucciones Paso a Paso:",
    recipeInstructionsSub: "Lee las instrucciones y cárgalas directamente en tu cronograma de seguimiento activo.",
    loadIntoCompanionCTA: "Cargar en el Cronograma de Fermentación Activo",

    // TAB 4 Companion
    timelineHeading: "Seguimiento Activo",
    timelineTitle: "Línea de Tiempo de Fermentación Activa",
    timelineSub: "Haz clic en cada paso durante tu sesión de horneado para verificar procedimientos, controlar duraciones de reposos y registrar tu progreso.",
    stepLabel: "Paso",
    activeStepFocus: "Foco en el Paso Activo",
    timerLabel: "Temporizador de Pliegues (Stretch & Fold)",
    cycleLabel: "Ciclo de 30 minutos",
    timerSub: "Intervalo sugerido entre pliegues para relajar la red de gluten de la masa.",
    pauseBtn: "Pausar",
    startTimerBtn: "Iniciar",
    skipBtn: "Omitir",
    perfectDoughLabel: "Indicadores de Red de Gluten Perfecta:",
    checklist1: "Red de gluten elástica que se estira sin romperse con facilidad (prueba de la ventana)",
    checklist2: "Burbujas finas de CO2 formándose bajo el domo de la masa",
    checklist3: "Masa ligera y aireada al tacto antes de volcarla sobre la bancada",
    didYouKnowTitle: "¿Sabías que?",
    didYouKnowDesc: "El pan con masa madre natural tiene un índice glucémico de alrededor de 54 (frente a más de 71 del pan blanco de molde industrial). ¡La fermentación prolongada ralentiza la digestión del almidón, mejorando la respuesta a la insulina!",

    // TAB 5 Assistant
    assistantHeading: "Mentoría de Fermentación Natural",
    activeBakerStatus: "Inteligencia Artificial Activa",
    clearConversation: "Limpiar Chat",
    placeholderUser: "Tú (Principiante)",
    placeholderMaster: "Maestro del Sourdough",
    inputPlaceholder: "Pregunta al Maestro: '¿Por qué mi pan salió plano?', '¿Para qué sirve la autólisis?'",
    uploadButton: "Adjuntar foto de tu producción/levain",
    dragAndDropPrompt: "¡Suelta tu foto aquí para adjuntar!",
    imageAttached: "Imagen adjunta",
    beginnerFaqTitle: "Dudas Frecuentes de Panaderos",
    beginnerFaqSub: "Toca cualquiera de las dudas más comunes para preguntar al Maestro panadero de inmediato:",
    faq1: "👃 ¿MI MASA MADRE huele a acetona?",
    faq2: "🍞 ¿Cómo lograr que el pan cree una greña ('ear') bonita?",
    faq3: "💦 ¿La masa está demasiado pegajosa y aguada?",
    faq4: "⚠️ ¿Diferencia entre sobrefermentado y subfermentado?",
    faq5: "🌾 ¿Cuál es la mejor harina para alimentar la masa madre?",

    footerQuote: "“Las levaduras salvajes no piden prisa ni alabanza, solo harina, agua y paciencia templada.”",
    footerCopyright: "Hub del Panadero Compañero de Masa Madre • Técnicas Tradicionales",
    hours: "horas",
    around: "Aproximadamente"
  }
};

export default function SourdoughCompanion() {
  // Tabs: 'starter' | 'calculator' | 'recipes' | 'timeline' | 'assistant'
  const [activeTab, setActiveTab] = useState<string>("starter");
  const [mounted, setMounted] = useState<boolean>(false);
  const [lang, setLang] = useState<"en" | "pt" | "es">("pt"); // Default to portuguese per user's locale/intent

  // Shorthand translations helper
  const t = TRANSLATIONS[lang];

  // Dynamically resolve recipes list based on language
  const RECIPES = lang === "en" ? RECIPES_EN : (lang === "es" ? RECIPES_ES : RECIPES_PT);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- TAB 1: STARTER SIMULATOR STATE ---
  const [simulatorHour, setSimulatorHour] = useState<number>(4);
  const [roomTemp, setRoomTemp] = useState<number>(24); // 18 - 32
  const [feedRatio, setFeedRatio] = useState<string>("1-1-1"); // '1-1-1' | '1-2-2' | '1-5-5'
  const [ageDays, setAgeDays] = useState<number>(7); // 1 - 10

  // Calculate simulated yeast properties
  const getSimulatedState = () => {
    let peakHour = 5;
    if (feedRatio === "1-2-2") peakHour = 6.5;
    if (feedRatio === "1-5-5") peakHour = 9.5;

    // Adjust peakHour for temperature (hotter makes it faster)
    const tempOffset = (24 - roomTemp) * 0.25; // 28C will subtract 1 hour
    peakHour = Math.max(2.5, peakHour + tempOffset);

    // Max rise multiplier
    let maxRise = 2.1; // healthy double+
    if (ageDays < 3) maxRise = 1.05; // barely any rise
    else if (ageDays < 5) maxRise = 1.4; // slight rise
    else if (ageDays < 7) maxRise = 1.8; // good rise

    // Calculate height curve at current hour
    let currentRiseFactor = 1.0;
    const x = simulatorHour;
    const peak = peakHour;

    if (x <= peak) {
      const progress = x / peak;
      currentRiseFactor = 1.0 + (maxRise - 1.0) * Math.sin((progress * Math.PI) / 2);
    } else {
      const hoursPastPeak = x - peak;
      const decayDuration = 16 - peak;
      const decayProgress = Math.min(1, hoursPastPeak / decayDuration);
      const postPeakHeight = maxRise - (maxRise - 1.2) * decayProgress;
      currentRiseFactor = postPeakHeight;
    }

    // Determine status & sensory notes inside simulated state in EN / PT / ES
    let status = lang === "en" ? "Rising" : (lang === "es" ? "Creciendo" : "Crescendo");
    let aroma = lang === "en" ? "Milky, mild cereal flour, slight sugar" : (lang === "es" ? "Cereal de leche suave, ligero dulzor de harina" : "Cereal de leite suave, doçura leve de farinha");
    let actionTip = lang === "en" ? "Yeast cell counts are dividing. Not ready to bake yet." : (lang === "es" ? "La población de levadura se está dividiendo. Aún no está lista para hornear." : "Leveduras se dividindo. Ainda não está pronto para panificação.");
    let acidity = lang === "en" ? "Low: Sweet & doughy" : (lang === "es" ? "Bajo: Dulce y harinoso" : "Baixo: Doce e pastoso");

    if (ageDays < 4) {
      status = lang === "en" ? "Dormant (Young)" : (lang === "es" ? "Inactivo (Joven)" : "Adormecido (Inativo)");
      aroma = lang === "en" ? "Flat, wet flour, slight yeast activity" : (lang === "es" ? "Firme, harina húmeda neutra, mínima actividad" : "Farinha úmida neutra, atividade biológica mínima");
      actionTip = lang === "en" ? "Starter is too young. Keep feeding daily! Do not bake yet." : (lang === "es" ? "La masa madre es demasiado joven. ¡Sigue alimentándola diariamente! No hornees todavía." : "Muito jovem. Continue alimentando diariamente! Evite assar pães por enquanto.");
      acidity = lang === "en" ? "Zero sourness" : (lang === "es" ? "Ausencia de acidez" : "Ausência de acidez");
    } else if (Math.abs(simulatorHour - peak) < 1.0) {
      status = lang === "en" ? "Primal Peak Window (Perfect!)" : (lang === "es" ? "Pico Dorado de Fermentación (¡Pan perfecto!)" : "Pico de Fermentação de Ouro (Seu pão perfeito!)");
      aroma = lang === "en" ? "Fruity, yogurt-like, white wine ferment, sweet apples" : (lang === "es" ? "Frutado intenso, manzana fermentada, aroma a yogur y vino blanco" : "Frutado marcante, maçã verde fermentada, espumante frutoso de maçã");
      actionTip = lang === "en" ? "Yeast cells are saturated with oxygen. Perfect elasticity! Mix your dough right now." : (lang === "es" ? "Células saturadas de energía y oxígeno. ¡Elasticidad perfecta! Incorpora tu levadura a la masa ahora mismo." : "Células no pico energético e de oxigênio. Elasticidade ideal! Adicione seu fermento à massa agora mesmo.");
      acidity = lang === "en" ? "Optimal: Smooth lactic acidity" : (lang === "es" ? "Óptimo: Acidez láctica suave" : "Ideal: Acidez láctica aveludada, sem traço forte de vinagre");
    } else if (simulatorHour < peak) {
      status = lang === "en" ? "Active & Rising" : (lang === "es" ? "Activo y Creciendo" : "Ativo e Crescendo");
      aroma = lang === "en" ? "Tangy, fresh dough, mild yogurt" : (lang === "es" ? "Ácido suave, fermento natural fresco, yogur natural" : "Azedinho suave, iogurte natural fresco, farinha úmida");
      actionTip = lang === "en" ? "Rising nicely. Wait a little longer for yeast population to reach maximum expansion." : (lang === "es" ? "Creciendo muy bien. Espera un poco más para que los gases alcancen su máxima expansión." : "Crescendo bem. Aguarde um pouco mais até acumular quantidade máxima de gases e atingir o topo de altura.");
      acidity = lang === "en" ? "Developing" : (lang === "es" ? "En desarrollo" : "Em desenvolvimento");
    } else {
      status = lang === "en" ? "Hungry / Falling" : (lang === "es" ? "Hambriento / Descendiendo" : "Faminto / Descendo");
      aroma = lang === "en" ? "Sharp beer, strong vinegar, light paint/acetone backtones" : (lang === "es" ? "Álcool fuerte de cerveza, vinagre de manzana, ligeros tonos de acetona" : "Álcool de cerveja forte, vinagre concentrado, traços leves de acetona");
      actionTip = lang === "en" ? "Passed the peak window. Yeast is food-depleted. Feed again soon, or store in fridge." : (lang === "es" ? "Pasó de su punto máximo. Las levaduras no tienen alimento. Aliméntala de nuevo pronto o guárdala en la nevera." : "Passou do pico. Sem comida, as leveduras estão exaustas. Alimente-o de novo ou reserve na geladeira.");
      acidity = lang === "en" ? "High: Sharp acetic acid (highly sour)" : (lang === "es" ? "Alto: Ácido acético punzante e intenso" : "Forte: Ácido acético agudo (bastante azedo)");
    }

    return {
      heightRatio: Math.min(2.5, Math.max(1.0, currentRiseFactor)),
      status,
      aroma,
      actionTip,
      acidity,
      peakHour: Math.round(peakHour * 10) / 10
    };
  };

  const sim = getSimulatedState();

  // --- TAB 2: BAKER'S CALCULATOR STATE ---
  const [totalFlour, setTotalFlour] = useState<number>(500); // g
  const [hydration, setHydration] = useState<number>(72); // %
  const [levainPct, setLevainPct] = useState<number>(20); // %
  const [saltPct, setSaltPct] = useState<number>(2.0); // %
  const [roomTempCalc, setRoomTempCalc] = useState<number>(23); // ºC

  // Calculated weights
  const calcWater = Math.round((totalFlour * hydration) / 100);
  const calcLevain = Math.round((totalFlour * levainPct) / 100);
  const calcSalt = Math.round(totalFlour * saltPct) / 100; // Round to decimal
  const roundedSalt = Math.round(totalFlour * saltPct) / 100;

  // Real baker temperature formula: "Desired Dough Temp" (usually 26°C / 78°F)
  // Ideal Water Temp = (3 * DesiredDoughTemp) - RoomTemp - FlourTemp - StarterTemp
  // Assuming flour and starter are at room temperature:
  const flourTemp = roomTempCalc;
  const starterTemp = roomTempCalc;
  const desiredDoughTemp = 26;
  const idealWaterTemp = (desiredDoughTemp * 3) - roomTempCalc - flourTemp - starterTemp;

  // --- TAB 3: RECIPES STATE ---
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(RECIPES[0]);

  // --- TAB 4: TIMELINE COMPANION STATE & TIMERS ---
  const [timelineRecipe, setTimelineRecipe] = useState<Recipe>(RECIPES[0]);

  // Synchronize translated recipes on language toggle
  useEffect(() => {
    setSelectedRecipe((prev) => {
      const match = RECIPES.find((r) => r.id === prev.id);
      return match || RECIPES[0];
    });
    setTimelineRecipe((prev) => {
      const match = RECIPES.find((r) => r.id === prev.id);
      return match || RECIPES[0];
    });
  }, [lang, RECIPES]);

  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  
  // Custom stretch-and-fold stopwatch simulator
  const [timerSeconds, setTimerSeconds] = useState<number>(1800); // 30 minutes default
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let id: any = null;
    if (isTimerRunning) {
      id = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 100); // Super-speed timer for a playful interactive prototype! 
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [isTimerRunning]);

  const handleStepClick = (idx: number) => {
    setActiveStepIdx(idx);
  };

  const toggleStepCompleted = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- TAB 5: AI COMPANION CHAT STATE ---
  interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    image?: {
      name: string;
      type: string;
      base64: string;
    };
  }

  const [messages, setMessages] = useState<Array<ChatMessage>>([
    {
      role: "assistant",
      content: "Saudações, jovem mestre padeiro! Eu sou o Mestre do Sourdough de Fermentação Natural. 🍞✨\n\nA fermentação natural lenta é um lindo diálogo entre farinha, água pura, temperatura ambiente e leveduras selvagens. Hoje vamos alimentar o seu Levain ou vamos iniciar alguma receita?"
    }
  ]);

  const [attachedImage, setAttachedImage] = useState<{
    name: string;
    type: string;
    base64: string;
  } | null>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert(lang === "en" ? "Only image files are supported." : (lang === "es" ? "Solo se admiten archivos de imagen." : "Apenas arquivos de imagem são suportados."));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAttachedImage({
          name: file.name,
          type: file.type,
          base64: event.target.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (e.target) {
      e.target.value = ""; // Reset input so the same file can be uploaded again
    }
  };

  // Synchronize first message on language change
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [
          {
            role: "assistant",
            content: lang === "en"
              ? "Greetings, young baker! I am the Levain Sourdough Master. 🍞✨\n\nNatural slow fermentation is a beautiful dialogue between flour, water, temperature, and wild yeasts. Today are we going to feed your Levain or start a recipe?"
              : lang === "es"
                ? "¡Saludos, joven maestro panadero! Yo soy el Maestro de la Masa Madre de Fermentación Natural. 🍞✨\n\nLa fermentación natural lenta es un hermoso diálogo entre harina, agua pura, temperatura ambiente y levaduras salvajes. ¿Hoy vamos a alimentar tu Levain o vamos a iniciar alguna receta?"
                : "Saudações, jovem mestre padeiro! Eu sou o Mestre do Sourdough de Fermentação Natural. 🍞✨\n\nA fermentação natural lenta é um lindo diálogo entre farinha, água pura, temperatura ambiente e leveduras selvagens. Hoje vamos alimentar o seu Levain ou vamos iniciar alguma receita?"
          }
        ];
      }
      return prev;
    });
  }, [lang]);

  const [inputValue, setInputValue] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputValue;
    if (!textToSend.trim() && !attachedImage) return;

    // Capture currently attached image and clear state
    const currentAttachedImage = attachedImage;
    setAttachedImage(null);

    // Add user message
    const updatedMessages: Array<ChatMessage> = [
      ...messages,
      {
        role: "user",
        content: textToSend,
        ...(currentAttachedImage ? { image: currentAttachedImage } : {})
      }
    ];
    setMessages(updatedMessages);
    setInputValue("");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!response.ok) {
        throw new Error("Dough did not rise correctly in the server. Try baking again!");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ *[Yeast proof error]*: ${err.message || "Failed to contact Sourdough Master. Check your connection or retry."}` }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#4a3f35] font-sans antialiased overflow-x-hidden pb-12">
      {/* Header Banner - High contrast editorial style */}
      <header id="header-nav" className="w-full border-b border-[#e8e2d9] bg-[#fcfaf7]/90 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#5c4033] text-[#fcfaf7] rounded-full shadow-sm">
                <Wheat className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold tracking-tight font-serif text-[#5c4033] italic flex items-center gap-2">
                  {t.appName} <span className="text-[9px] md:text-[10px] font-sans font-semibold py-0.5 px-1.5 md:px-2 bg-[#f5f2ee] text-[#a68a64] border border-[#e8e2d9] rounded-full uppercase tracking-wider">{t.appSub}</span>
                </h1>
                <p className="text-[10px] md:text-xs text-[#8c7e6d] hidden sm:block">{t.appDesc}</p>
              </div>
            </div>

            {/* Language Selector (mobile only) */}
            <div className="flex md:hidden items-center gap-1 bg-[#f5f2ee] p-1 rounded-full border border-[#e8e2d9] shadow-inner shrink-0">
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full transition-all duration-200 cursor-pointer ${
                  lang === "en" ? "bg-[#5c4033] text-[#fcfaf7] shadow-sm font-extrabold" : "text-[#8c7e6d] hover:text-[#5c4033]"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("pt")}
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full transition-all duration-200 cursor-pointer ${
                  lang === "pt" ? "bg-[#5c4033] text-[#fcfaf7] shadow-sm font-extrabold" : "text-[#8c7e6d] hover:text-[#5c4033]"
                }`}
              >
                PT
              </button>
              <button
                onClick={() => setLang("es")}
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full transition-all duration-200 cursor-pointer ${
                  lang === "es" ? "bg-[#5c4033] text-[#fcfaf7] shadow-sm font-extrabold" : "text-[#8c7e6d] hover:text-[#5c4033]"
                }`}
              >
                ES
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {/* Language Selector (desktop only) */}
            <div className="hidden md:flex items-center gap-1 bg-[#f5f2ee] p-1 rounded-full border border-[#e8e2d9] shadow-inner">
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all duration-200 cursor-pointer ${
                  lang === "en" ? "bg-[#5c4033] text-[#fcfaf7] shadow-sm font-extrabold" : "text-[#8c7e6d] hover:text-[#5c4033]"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("pt")}
                className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all duration-200 cursor-pointer ${
                  lang === "pt" ? "bg-[#5c4033] text-[#fcfaf7] shadow-sm font-extrabold" : "text-[#8c7e6d] hover:text-[#5c4033]"
                }`}
              >
                PT
              </button>
              <button
                onClick={() => setLang("es")}
                className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all duration-200 cursor-pointer ${
                  lang === "es" ? "bg-[#5c4033] text-[#fcfaf7] shadow-sm font-extrabold" : "text-[#8c7e6d] hover:text-[#5c4033]"
                }`}
              >
                ES
              </button>
            </div>

            {/* Core App Navigation Tabs - Scrollable on mobile, beautiful, no wrapping */}
            <nav id="navbar-tabs" className="flex items-center gap-1 bg-[#f5f2ee] p-1 rounded-full border border-[#e8e2d9] overflow-x-auto flex-nowrap w-full md:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <button
                id="tab-starter-btn"
                onClick={() => setActiveTab("starter")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-full transition-all duration-200 whitespace-nowrap uppercase tracking-widest ${
                  activeTab === "starter"
                    ? "bg-[#5c4033] text-[#fcfaf7] shadow"
                    : "text-[#8c7e6d] hover:text-[#5c4033] hover:bg-[#e8e2d9]/30"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                {t.tabStarter}
              </button>
              <button
                id="tab-calculator-btn"
                onClick={() => {
                  setActiveTab("calculator");
                  setTimelineRecipe(selectedRecipe);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-full transition-all duration-200 whitespace-nowrap uppercase tracking-widest ${
                  activeTab === "calculator"
                    ? "bg-[#5c4033] text-[#fcfaf7] shadow"
                    : "text-[#8c7e6d] hover:text-[#5c4033] hover:bg-[#e8e2d9]/30"
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                {t.tabCalculator}
              </button>
              <button
                id="tab-recipes-btn"
                onClick={() => setActiveTab("recipes")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-full transition-all duration-200 whitespace-nowrap uppercase tracking-widest ${
                  activeTab === "recipes"
                    ? "bg-[#5c4033] text-[#fcfaf7] shadow"
                    : "text-[#8c7e6d] hover:text-[#5c4033] hover:bg-[#e8e2d9]/30"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                {t.tabRecipes}
              </button>
              <button
                id="tab-timeline-btn"
                onClick={() => setActiveTab("timeline")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-full transition-all duration-200 whitespace-nowrap uppercase tracking-widest ${
                  activeTab === "timeline"
                    ? "bg-[#5c4033] text-[#fcfaf7] shadow"
                    : "text-[#8c7e6d] hover:text-[#5c4033] hover:bg-[#e8e2d9]/30"
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                {t.tabTimeline}
              </button>
              <button
                id="tab-assistant-btn"
                onClick={() => setActiveTab("assistant")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-full transition-all duration-200 whitespace-nowrap uppercase tracking-widest ${
                  activeTab === "assistant"
                    ? "bg-[#5c4033] text-[#fcfaf7] shadow"
                    : "text-[#8c7e6d] hover:text-[#5c4033] hover:bg-[#e8e2d9]/30"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {t.tabAssistant}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        <AnimatePresence mode="wait">
          {/* ==================== TAB 1: STARTER LAB & SIMULATOR ==================== */}
          {activeTab === "starter" && (
            <motion.div
              key="starter-lab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Scientific Education & Timeline */}
              <div id="starter-edu-card" className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#e8e2d9] shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-[#f5f2ee] text-[#a68a64] border border-[#e8e2d9] rounded-full text-xs font-bold uppercase tracking-wider">{t.starterJourney}</span>
                    <span className="text-xs text-[#8c7e6d]">•</span>
                    <span className="text-xs text-[#8c7e6d] flex items-center gap-1 font-mono uppercase tracking-wide"><Clock className="w-3.5 h-3.5 text-[#a68a64]" /> {t.starterWild}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#5c4033] tracking-tight leading-tight">
                    {t.starterHeading}
                  </h2>
                  <p className="font-sans text-sm leading-relaxed text-[#6b5e4f] mt-3">
                    {t.starterSub}
                  </p>
                </div>

                {/* Day-by-Day Timeline steps */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-[#8c7e6d] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#a68a64]" /> {t.milestoneTitle}
                  </h3>

                  <div className="relative border-l border-[#e8e2d9] pl-6 ml-3 space-y-6">
                    {t.milestoneDays.map((m, mIdx) => (
                      <div key={mIdx} className="relative">
                        <div className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white ${mIdx === 3 ? "bg-[#5c4033] animate-pulse" : "bg-[#a68a64]"}`} />
                        <div className={`text-xs font-bold font-sans uppercase tracking-wider ${mIdx === 3 ? "text-[#5c4033]" : "text-[#a68a64]"}`}>{m.title}</div>
                        <p className="text-xs font-sans text-[#6b5e4f] leading-relaxed mt-1">
                          {m.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#f5f2ee] border border-[#e8e2d9] p-5 rounded-2xl flex items-start gap-4">
                  <Info className="w-5 h-5 text-[#5c4033] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#6b5e4f] space-y-1">
                    <p className="font-bold text-[#5c4033] uppercase tracking-wide">{t.masterTipTitle}</p>
                    <p className="leading-relaxed">{t.masterTipDesc}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Rise Simulator */}
              <div id="starter-simulator-card" className="lg:col-span-5 bg-[#f5f2ee] p-8 rounded-3xl border border-[#e8e2d9] shadow-sm space-y-6 flex flex-col justify-between">
                <div>
                  <div className="uppercase text-[10px] tracking-[0.2em] text-[#8c7e6d] font-sans font-bold mb-2">{t.activePhase}</div>
                  {/* Simulated Glass Jar Visuals */}
                <div id="jar-visualizer" className="relative w-44 h-80 bg-white border-4 border-[#dcd7cf] rounded-b-2xl rounded-t-3xl mx-auto my-6 flex flex-col justify-end overflow-hidden shadow-sm">
                  {/* Glass reflections */}
                  <div className="absolute top-0 left-4 w-2 h-full bg-white/20 skew-x-12 z-20 pointer-events-none" />
                  {/* Liquid measurement marks on glass */}
                  <div className="absolute right-2 top-0 h-full flex flex-col justify-between text-[9px] font-mono text-[#8c7e6d] py-6 pointer-events-none z-10 select-none">
                    <span>{t.glassTriple}</span>
                    <span>{t.glassDouble}</span>
                    <span>{t.glassFeed}</span>
                  </div>

                  {/* Starter Dough Rise */}
                  <motion.div
                    id="starter-fluid-mesh"
                    style={{ height: `${20 * sim.heightRatio}%` }}
                    className="relative w-full bg-gradient-to-t from-[#f4f1ed] to-[#white] border-t-2 border-[#a68a64] flex flex-col justify-start items-center p-2 transition-all duration-300"
                  >
                    {/* Tiny bubbles representation */}
                    <div className="absolute inset-0 grid grid-cols-6 gap-2 p-3 opacity-95 overflow-hidden">
                      {mounted && Array.from({ length: Math.round(9 * sim.heightRatio) }).map((_, i) => (
                        <div
                           key={i}
                           className="bg-white/80 border border-[#e8e2d9] rounded-full animate-bubble"
                           style={{
                             width: `${Math.max(6, (i % 3) * 6)}px`,
                             height: `${Math.max(6, (i % 3) * 6)}px`,
                             transform: `translateY(${(Math.sin((i + simulatorHour) * 1.5) * 8).toFixed(4)}px)`,
                             opacity: ageDays < 3 ? 0.1 : 0.8
                           }}
                        />
                      ))}
                    </div>

                    {/* Peak Marker Line */}
                    {Math.abs(simulatorHour - sim.peakHour) < 1 && ageDays >= 5 && (
                      <div className="absolute -top-3 left-0 w-full flex justify-center z-10 pointer-events-none">
                        <span className="bg-[#5c4033] text-[#fcfaf7] font-sans text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                          {t.bakeActive}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
                </div>

                {/* Interactive sliders for variables */}
                <div className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-[#e8e2d9]">
                  {/* Slider 1: Hours since fed */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="flex items-center gap-1.5 font-sans uppercase text-[10px] tracking-wider text-[#6b5e4f]"><Clock className="w-3.5 h-3.5 text-[#5c4033]" /> {t.hoursFedLabel}</span>
                      <span className="font-mono bg-[#f5f2ee] text-[#5c4033] border border-[#e8e2d9] px-2.5 py-0.5 rounded-full text-[11px] font-semibold">{simulatorHour} {lang === "en" ? "Hrs" : "h"}</span>
                    </div>
                    <input
                      id="simulator-hour-slider"
                      type="range"
                      min={0}
                      max={16}
                      step={0.5}
                      value={simulatorHour}
                      onChange={(e) => setSimulatorHour(parseFloat(e.target.value))}
                      className="w-full accent-[#5c4033] cursor-pointer"
                    />
                  </div>

                  {/* Slider 2: Kitchen Temp */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="flex items-center gap-1.5 font-sans uppercase text-[10px] tracking-wider text-[#6b5e4f]"><Flame className="w-3.5 h-3.5 text-[#a68a64]" /> {t.kitchenTempLabel}</span>
                      <span className="font-mono bg-[#f5f2ee] text-[#a68a64] border border-[#e8e2d9] px-2.5 py-0.5 rounded-full text-[11px] font-semibold">{roomTemp}ºC</span>
                    </div>
                    <input
                      id="room-temp-slider"
                      type="range"
                      min={16}
                      max={32}
                      step={1}
                      value={roomTemp}
                      onChange={(e) => setRoomTemp(parseInt(e.target.value))}
                      className="w-full accent-[#a68a64] cursor-pointer"
                    />
                  </div>

                  {/* Variable Picker 1: Feed ratio */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#8c7e6d]">{t.feedRatioLabel}</label>
                      <select
                        id="feed-ratio-select"
                        value={feedRatio}
                        onChange={(e) => setFeedRatio(e.target.value)}
                        className="w-full text-xs bg-[#fcfaf7] text-[#4a3f35] border border-[#e8e2d9] rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#5c4033] font-sans"
                      >
                        <option value="1-1-1">1:1:1 ({lang === "en" ? "Thick, Fast" : "Consistente, Rápido"})</option>
                        <option value="1-2-2">1:2:2 ({lang === "en" ? "Moderate" : "Moderado"})</option>
                        <option value="1-5-5">1:5:5 ({lang === "en" ? "Sweet, Slow" : "Doce, Lento"})</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#8c7e6d]">{t.cultureAgeLabel}</label>
                      <select
                        id="culture-age-select"
                        value={ageDays}
                        onChange={(e) => setAgeDays(parseInt(e.target.value))}
                        className="w-full text-xs bg-[#fcfaf7] text-[#4a3f35] border border-[#e8e2d9] rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#5c4033] font-sans"
                      >
                        <option value={1}>{lang === "en" ? "Day 1-2 (Dormant)" : "Dia 1-2 (Adormecido)"}</option>
                        <option value={4}>{lang === "en" ? "Day 3-4 (Acidic)" : "Dia 3-4 (Acidulado)"}</option>
                        <option value={6}>{lang === "en" ? "Day 5-6 (Developing)" : "Dia 5-6 (Em Formação)"}</option>
                        <option value={10}>{lang === "en" ? "Day 7+ (Bake Ready)" : "Dia 7+ (Pronto para Assar)"}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Output analysis stats based on simulator math */}
                <div id="simulator-output-box" className="p-5 bg-white border border-[#e8e2d9] rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between border-b border-[#e8e2d9] pb-2">
                    <span className="text-[#8c7e6d] font-sans uppercase text-[10px] tracking-wider">{t.currentPhaseLabel}</span>
                    <span className="font-semibold text-[#5c4033] italic">{sim.status}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#e8e2d9] pb-2">
                    <span className="text-[#8c7e6d] font-sans uppercase text-[10px] tracking-wider">{t.expectedPeakLabel}</span>
                    <span className="font-mono font-semibold text-[#4a3f35]">
                      {lang === "en" ? `Around ${sim.peakHour} hours` : `Aproximadamente ${sim.peakHour} horas`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#e8e2d9] pb-2">
                    <span className="text-[#8c7e6d] font-sans uppercase text-[10px] tracking-wider">{t.aromaLabel}</span>
                    <span className="font-semibold text-right text-[#4a3f35]">{sim.aroma}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#e8e2d9] pb-2">
                    <span className="text-[#8c7e6d] font-sans uppercase text-[10px] tracking-wider">{t.acidityLabel}</span>
                    <span className="font-semibold text-[#4a3f35]">{sim.acidity}</span>
                  </div>
                  <div className="pt-2 text-[#5c4033] text-xs leading-relaxed italic">
                    <strong>{t.masterAdviceLabel}</strong> {sim.actionTip}
                  </div>
                </div>

                <button
                  id="go-to-baker-calculator-btn"
                  onClick={() => {
                    setActiveTab("calculator");
                  }}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-4 px-6 bg-[#5c4033] text-[#fcfaf7] hover:bg-[#4a342a] transition-colors rounded-full font-sans text-xs uppercase tracking-widest font-bold cursor-pointer"
                >
                  {t.calculateFlourCTA} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ==================== TAB 2: BAKER'S CALCULATOR ==================== */}
          {activeTab === "calculator" && (
            <motion.div
              key="calculator-hub"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column inputs */}
              <div id="calculator-inputs-card" className="lg:col-span-6 bg-white p-8 rounded-3xl border border-[#e8e2d9] shadow-sm space-y-6">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-[#5c4033] flex items-center gap-2">
                    <Scale className="w-7 h-7 text-[#5c4033]" />
                    {t.calcHeading}
                  </h2>
                  <p className="font-sans text-xs text-[#6b5e4f] mt-1.5 leading-relaxed">
                    {t.calcSub}
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Input 1: Total dry flour */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="font-sans text-[#6b5e4f] uppercase tracking-wider text-[10px]">{t.desiredFlourLabel}</span>
                      <span className="font-mono bg-[#f5f2ee] px-2.5 py-0.5 rounded-full border border-[#e8e2d9] text-[#5c4033] text-[11px] font-bold">{totalFlour}g</span>
                    </div>
                    <input
                      id="total-flour-input"
                      type="range"
                      min={250}
                      max={2000}
                      step={50}
                      value={totalFlour}
                      onChange={(e) => setTotalFlour(parseInt(e.target.value))}
                      className="w-full accent-[#5c4033] cursor-pointer"
                    />
                    <p className="text-[10px] font-sans text-[#8c7e6d]">{t.yieldLabel} ~{Math.round(totalFlour + calcWater + calcLevain + roundedSalt)}g {t.goodFor} {Math.round((totalFlour * 1.8) / 800) || 1} {t.standardBoules}.</p>
                  </div>

                  {/* Input 2: Hydration % */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="font-sans text-[#6b5e4f] uppercase tracking-wider text-[10px]">{t.waterHydrationLabel}</span>
                      <span className="font-mono bg-[#f5f2ee] px-2.5 py-0.5 rounded-full border border-[#e8e2d9] text-[#5c4033] text-[11px] font-bold">{hydration}%</span>
                    </div>
                    <input
                      id="calc-hydration-input"
                      type="range"
                      min={60}
                      max={85}
                      step={1}
                      value={hydration}
                      onChange={(e) => setHydration(parseInt(e.target.value))}
                      className="w-full accent-[#5c4033] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-sans text-[#8c7e6d] font-semibold">
                      <span>60% {t.stiff}</span>
                      <span className="font-bold text-[#a68a64] bg-[#f5f2ee] border border-[#e8e2d9] px-2.5 py-0.5 rounded-full uppercase tracking-tighter text-[9px]">
                        {hydration <= 68 ? t.beginnerHydrationText : hydration <= 75 ? t.intermediateHydrationText : t.advancedHydrationText}
                      </span>
                      <span>85% {t.ciabattaStyle}</span>
                    </div>
                  </div>

                  {/* Input 3: Levain/Starter % */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="font-sans text-[#6b5e4f] uppercase tracking-wider text-[10px]">{t.levainPctLabel}</span>
                      <span className="font-mono bg-[#f5f2ee] px-2.5 py-0.5 rounded-full border border-[#e8e2d9] text-[#a68a64] text-[11px] font-bold">{levainPct}%</span>
                    </div>
                    <input
                      id="calc-levain-input"
                      type="range"
                      min={10}
                      max={30}
                      step={5}
                      value={levainPct}
                      onChange={(e) => setLevainPct(parseInt(e.target.value))}
                      className="w-full accent-[#a68a64] cursor-pointer"
                    />
                    <p className="text-[10px] font-sans text-[#8c7e6d]">{t.levainPctSub}</p>
                  </div>

                  {/* Input 4: Salt % */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="font-sans text-[#6b5e4f] uppercase tracking-wider text-[10px]">{t.saltPctLabel}</span>
                      <span className="font-mono bg-[#f5f2ee] px-2.5 py-0.5 rounded-full border border-[#e8e2d9] text-[#5c4033] text-[11px] font-bold">{saltPct}%</span>
                    </div>
                    <input
                      id="calc-salt-input"
                      type="range"
                      min={1.5}
                      max={2.5}
                      step={0.1}
                      value={saltPct}
                      onChange={(e) => setSaltPct(parseFloat(e.target.value))}
                      className="w-full accent-[#5c4033] cursor-pointer"
                    />
                    <p className="text-[10px] font-sans text-[#8c7e6d]">{t.saltPctSub}</p>
                  </div>

                  {/* Input 5: Ambient Temp calc */}
                  <div className="space-y-1.5 pt-3 border-t border-dashed border-[#e8e2d9]">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 font-sans uppercase text-[10px] tracking-wider text-[#6b5e4f]"><Flame className="w-3.5 h-3.5 text-[#a68a64]" /> {t.localRoomTempLabel}</span>
                      <span className="font-mono bg-[#f5f2ee] px-2.5 py-0.5 rounded-full border border-[#e8e2d9] text-[#5c4033] text-[11px] font-bold">{roomTempCalc}ºC</span>
                    </div>
                    <input
                      id="calc-temp-slider"
                      type="range"
                      min={18}
                      max={30}
                      step={1}
                      value={roomTempCalc}
                      onChange={(e) => setRoomTempCalc(parseInt(e.target.value))}
                      className="w-full accent-[#a68a64] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Display computed values in elegant recipe sheet */}
              <div id="calculator-receipt-card" className="lg:col-span-6 bg-[#f5f2ee] p-8 rounded-3xl border border-[#e8e2d9] shadow-sm relative overflow-hidden flex flex-col justify-between">
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8e2d9]/40 rounded-full filter blur-2xl z-0" />

                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="uppercase text-[10px] tracking-[0.2em] text-[#8c7e6d] font-sans font-bold">{t.receiptTitle}</span>
                      <h3 className="text-2xl font-serif font-bold text-[#5c4033] mt-1 italic">{t.receiptSub}</h3>
                    </div>
                    <Wheat className="w-8 h-8 text-[#a68a64] shrink-0" />
                  </div>

                  <div className="space-y-4">
                    {/* Flour */}
                    <div className="flex justify-between items-center py-2 border-b border-[#e8e2d9]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#5c4033] text-[#fcfaf7] rounded-full"><Wheat className="w-4 h-4" /></div>
                        <div>
                          <p className="text-sm font-semibold text-[#4a3f35] font-sans">{t.breadFlourWeightLabel}</p>
                          <p className="text-[10px] text-[#8c7e6d] font-sans">{t.breadFlourWeightDesc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold font-serif text-[#5c4033]">{totalFlour} g</p>
                      </div>
                    </div>

                    {/* Water */}
                    <div className="flex justify-between items-center py-2 border-b border-[#e8e2d9]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#a68a64] text-[#fcfaf7] rounded-full"><Droplet className="w-4 h-4" /></div>
                        <div>
                          <p className="text-sm font-semibold text-[#4a3f35] font-sans">{t.purifiedWaterWeightLabel}</p>
                          <p className="text-[10px] text-[#8c7e6d] font-sans">{t.purifiedWaterWeightDesc} ({hydration}%)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold font-serif text-[#5c4033]">{calcWater} g</p>
                      </div>
                    </div>

                    {/* Active Levain */}
                    <div className="flex justify-between items-center py-2 border-b border-[#e8e2d9]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#5c4033] text-[#fcfaf7] rounded-full"><Sparkles className="w-4 h-4" /></div>
                        <div>
                          <p className="text-sm font-semibold text-[#4a3f35] font-sans">{t.activeMatureLevainLabel}</p>
                          <p className="text-[10px] text-[#8c7e6d] font-sans">{t.activeMatureLevainDesc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold font-serif text-[#5c4033]">{calcLevain} g</p>
                      </div>
                    </div>

                    {/* Fine Sea Salt */}
                    <div className="flex justify-between items-center py-2 border-b border-[#e8e2d9]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#8c7e6d] text-[#fcfaf7] rounded-full"><Scale className="w-4 h-4" /></div>
                        <div>
                          <p className="text-sm font-semibold text-[#4a3f35] font-sans">{t.fineSeaSaltLabel}</p>
                          <p className="text-[10px] text-[#8c7e6d] font-sans">{t.fineSeaSaltDesc} ({saltPct}%)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold font-serif text-[#5c4033]">{roundedSalt} g</p>
                      </div>
                    </div>
                  </div>

                  {/* Sourdough Master Water Temperature Suggestion */}
                  <div className="p-5 bg-white border border-[#e8e2d9] rounded-2xl space-y-2">
                    <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#a68a64] flex items-center gap-1.5">
                      <Flame className="w-4 h-4" /> {t.waterTempGuidanceTitle}
                    </p>
                    <p className="text-xs text-[#6b5e4f] leading-relaxed">
                      {t.waterTempGuidanceDesc}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1">
                      <span className="text-[10px] text-[#8c7e6d]">{t.formulaLabel} (26 × 3) - Room - Flour - Levain</span>
                      <span className="font-mono text-xs font-bold bg-[#5c4033] text-[#fcfaf7] px-3 py-1 rounded-full border border-[#5c4033]">
                        {idealWaterTemp}ºC ({Math.round((idealWaterTemp * 9/5) + 32)}ºF)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[#e8e2d9] space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-[#8c7e6d] font-sans uppercase text-[10px] tracking-wider">{t.totalDoughWeightLabel}</span>
                    <span className="font-serif text-2xl font-bold text-[#5c4033]">
                      {totalFlour + calcWater + calcLevain + Math.round(roundedSalt)} g
                    </span>
                  </div>

                  <button
                    id="apply-formula-to-companion-btn"
                    onClick={() => {
                      // Apply and go to companion
                      setTimelineRecipe({
                        id: "custom-scaled-loaf",
                        name: lang === "en" ? `Custom Scaled Loaf (${hydration}% Hydration)` : `Pão Customizado (${hydration}% de Hidratação)`,
                        description: lang === "en" ? "Your personalized yeast formula based on baker's strict mathematical percentages." : "Sua receita de pão artesanal rústico personalizada com base matemática exata.",
                        difficulty: hydration > 75 ? "Advanced" : "Intermediate",
                        hydration: hydration,
                        levain: levainPct,
                        salt: saltPct,
                        wholeWheat: 10,
                        ryeOrFlourType: lang === "en" ? "Custom Mix" : "Mistura Personalizada",
                        bulkHours: idealWaterTemp < 20 ? 6.0 : 4.5,
                        bakeTimeMins: 45,
                        instructions: lang === "en" ? [
                          `Autolyse: Combine ${totalFlour}g bread flour and ${calcWater}g water (at ${idealWaterTemp}ºC). Rest for 45 minutes of protein gluten relaxation.`,
                          `Add Culture: Work in ${calcLevain}g mature bubble Levain starter. Rest 30 minutes.`,
                          `Add Salt: Fold in ${roundedSalt}g salt thoroughly with damp fingers. Perform wet slab-and-folds.`,
                          `Bulk Fermentation: Perform 4 sets of bulk coil or stretch folds spaced 30 minutes apart. Let ferment until bubble-crowned.`,
                          "Pre-shape: Gently shape boule on workspace. Rest covered for 20 mins.",
                          "Final shape: Dust, envelope-fold, draw-tension boule, lay smoothly in cold banneton.",
                          "Cold Retard: Cold prove in clean plastic bag inside fridge for 15 hours to develop optimal lactic acidity.",
                          "Bake: Transfer to preheated dutch oven. Slash, pop lid on, bake 20 mins, then bake 20-25 mins open lid."
                        ] : [
                          `Autólise: Combine ${totalFlour}g de farinha e ${calcWater}g de água (a ${idealWaterTemp}ºC). Descanse por 45 minutos para relaxamento proteico do glúten.`,
                          `Adicionar Levain: Incorpore ${calcLevain}g do levain maduro borbulhante. Descanse por 30 minutos.`,
                          `Adicionar Sal: Misture ${roundedSalt}g de sal homogeneamente com dedos úmidos. Faça dobras suaves na travessa.`,
                          `Fermentação em Bloco: Faça 4 séries de dobras com espaço de 30 minutos entre elas. Deixe descansar até preencher com gases.`,
                          "Pré-modelagem: Dê formato leve e arredondado à massa no balcão. Descanse protegida por 20 min.",
                          "Modelagem Final: Enfarinhe, dobre em envelope, vire aplicando fricção para dar tensão e leve ao banneton.",
                          "Fermentação a Frio: Deixe fermentar lentamente sob refrigeração por 15 horas para enriquecer os compostos de ácido lático.",
                          "Assar: Asse na panela de ferro preaquecida. Faça a pestana com lâmina afiada, tampe por 20 min e depois tire a tampa por mais 20-25 min."
                        ]
                      });
                      setActiveTab("timeline");
                      setActiveStepIdx(0);
                      setCompletedSteps({});
                      setTimerSeconds(1800);
                      setIsTimerRunning(false);
                    }}
                    className="w-full py-4 px-6 bg-[#5c4033] text-[#fcfaf7] hover:bg-[#4a342a] transition-colors rounded-full font-sans text-xs uppercase tracking-widest font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    {t.applyFormulaCTA} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== TAB 3: DYNAMIC RECIPES LIST ==================== */}
          {activeTab === "recipes" && (
            <motion.div
              key="recipes-gallery"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="px-3 py-1 bg-[#f5f2ee] text-[#a68a64] border border-[#e8e2d9] rounded-full text-xs font-bold uppercase tracking-widest">{t.archiveHeading}</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#5c4033] tracking-tight leading-tight mt-1">
                  {t.archiveTitle}
                </h2>
                <p className="font-sans text-sm text-[#6b5e4f] leading-relaxed max-w-lg mx-auto">
                  {t.archiveSub}
                </p>
              </div>

              {/* Recipe grid list */}
              <div id="recipe-cards-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {RECIPES.map((recipe) => (
                  <div
                    key={recipe.id}
                    id={`recipe-card-${recipe.id}`}
                    onClick={() => setSelectedRecipe(recipe)}
                    className={`relative p-8 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                      selectedRecipe.id === recipe.id
                        ? "bg-white border-[#5c4033] shadow-md ring-1 ring-[#5c4033]"
                        : "bg-[#f5f2ee]/50 border-[#e8e2d9] hover:border-[#a68a64] hover:bg-white shadow-sm"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="px-2.5 py-0.5 bg-white border border-[#e8e2d9] text-[#8c7e6d] rounded-full font-mono text-[9px] uppercase tracking-wider font-bold">
                            {lang === "en" ? recipe.difficulty : (recipe.difficulty === "Beginner" ? "Fácil" : recipe.difficulty === "Intermediate" ? "Médio" : "Avançado")}
                          </span>
                          <h3 className="text-xl font-bold font-serif text-[#5c4033] mt-2 leading-tight">{recipe.name}</h3>
                        </div>
                        <Wheat className="w-5 h-5 text-[#a68a64] shrink-0 mt-1" />
                      </div>

                      <p className="text-xs text-[#6b5e4f] font-sans leading-relaxed min-h-12 mt-1">
                        {recipe.description}
                      </p>

                      {/* Percentages badge layout */}
                      <div className="grid grid-cols-3 gap-2 bg-[#f5f2ee] border border-[#e8e2d9] p-3 rounded-2xl text-xs">
                        <div className="text-center border-r border-[#e8e2d9]">
                          <p className="text-[10px] text-[#8c7e6d] font-sans uppercase font-bold tracking-wider">{lang === "en" ? "Hydration" : "Hidratação"}</p>
                          <p className="font-bold font-mono text-[#5c4033] text-[13px]">{recipe.hydration}%</p>
                        </div>
                        <div className="text-center border-r border-[#e8e2d9]">
                          <p className="text-[10px] text-[#8c7e6d] font-sans uppercase font-bold tracking-wider">Levain</p>
                          <p className="font-bold font-mono text-[#5c4033] text-[13px]">{recipe.levain}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-[#8c7e6d] font-sans uppercase font-bold tracking-wider">{lang === "en" ? "Sea Salt" : "Sal Marinho"}</p>
                          <p className="font-bold font-mono text-[#5c4033] text-[13px]">{recipe.salt}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#e8e2d9] flex justify-between items-center">
                      <div className="text-[11px] text-[#8c7e6d] font-sans">
                        <p>{t.grainBlend}: {recipe.wholeWheat > 0 ? `${recipe.wholeWheat}% ${t.wheatLabel}, ` : ""}{recipe.ryeOrFlourType}</p>
                      </div>
                      <div className="flex items-center text-xs font-bold font-sans uppercase text-[#5c4033] tracking-widest gap-1 shrink-0">
                        {t.viewSteps} <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Steps display for active selected recipe */}
              <div id="recipe-detail-viewer" className="bg-white p-8 rounded-3xl border border-[#e8e2d9] shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e8e2d9]">
                  <div>
                    <h3 className="text-2xl font-bold font-serif text-[#5c4033] italic leading-tight">{t.recipeInstructionsTitle}: {selectedRecipe.name}</h3>
                    <p className="text-xs font-sans text-[#8c7e6d] mt-1">{t.recipeInstructionsSub}</p>
                  </div>
                  <button
                    id="apply-selected-recipe-btn"
                    onClick={() => {
                      setTimelineRecipe(selectedRecipe);
                      setActiveTab("timeline");
                      setActiveStepIdx(0);
                      setCompletedSteps({});
                      setTimerSeconds(1800);
                      setIsTimerRunning(false);
                    }}
                    className="py-3 px-6 bg-[#5c4033] font-bold text-[#fcfaf7] rounded-full text-xs hover:bg-[#4a342a] transition-colors shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-widest font-sans cursor-pointer"
                  >
                    {t.loadIntoCompanionCTA} <Timer className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRecipe.instructions.map((step, idx) => (
                    <div key={idx} id={`selected-recipe-step-${idx}`} className="p-5 bg-[#f5f2ee] border border-[#e8e2d9] rounded-2xl space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#5c4033] text-[#fcfaf7] text-xs font-bold font-mono flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#5c4033]">{step.split(":")[0]}</span>
                      </div>
                      <p className="text-xs text-[#6b5e4f] font-sans leading-relaxed ps-8">
                        {step.split(":").slice(1).join(":")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== TAB 4: INTERACTIVE TIMELINE COMPANION ==================== */}
          {activeTab === "timeline" && (
            <motion.div
              key="timeline-companion"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: List of fermentation stages / checkpoints */}
              <div id="timeline-flow-card" className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#e8e2d9] shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-[#f5f2ee] text-[#a68a64] border border-[#e8e2d9] rounded-full text-xs font-bold uppercase tracking-widest">{lang === "en" ? "Live Companion" : "Companheiro Ativo"}</span>
                    <span className="text-xs text-[#8c7e6d]">•</span>
                    <span className="text-[10px] font-bold font-sans uppercase tracking-wider text-[#5c4033] bg-[#f5f2ee] border border-[#e8e2d9] px-2.5 py-0.5 rounded-full">{timelineRecipe.name}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#5c4033] tracking-tight leading-tight">{t.timelineTitle}</h2>
                  <p className="font-sans text-xs text-[#6b5e4f] mt-1.5 leading-relaxed">
                    {t.timelineSub}
                  </p>
                </div>

                <div className="space-y-3">
                  {timelineRecipe.instructions.map((stepStr, idx) => {
                    const stepName = stepStr.split(":")[2] || stepStr.split(":")[0];
                    const stepText = stepStr.split(":").slice(1).join(":");
                    const isCompleted = completedSteps[idx] || false;
                    const isActive = activeStepIdx === idx;

                    return (
                      <div
                        key={idx}
                        id={`timeline-step-${idx}`}
                        onClick={() => handleStepClick(idx)}
                        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start gap-3 justify-between ${
                          isActive
                            ? "bg-[#f5f2ee] border-[#5c4033] shadow-sm"
                            : "bg-white border-[#e8e2d9] hover:bg-[#f5f2ee]/50 shadow-sm"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Circle click for completion status */}
                          <button
                            id={`timeline-checkbox-${idx}`}
                            onClick={(e) => toggleStepCompleted(idx, e)}
                            className={`p-1.5 mt-0.5 rounded-full transition duration-150 shrink-0 ${
                              isCompleted
                                ? "bg-[#5c4033] text-[#fcfaf7]"
                                : "bg-[#f5f2ee] hover:bg-[#e8e2d9] text-[#8c7e6d]"
                            }`}
                          >
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5" />}
                          </button>

                          <div>
                            <p className={`text-xs font-bold font-sans uppercase tracking-wider leading-none ${isActive ? "text-[#5c4033]" : "text-[#4a3f35]"}`}>
                              {lang === "en" ? "Step" : "Etapa"} {idx + 1}: {stepStr.split(":")[0]}
                            </p>
                            <p className="text-[11px] font-sans text-[#6b5e4f] leading-relaxed mt-2 line-clamp-2 md:line-clamp-none">
                              {stepText}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 text-[#8c7e6d] shrink-0 self-center transition-transform ${isActive ? "rotate-90 text-[#5c4033] font-bold" : ""}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Focus card on active step with active stopwatch timers */}
              <div id="timeline-detail-box" className="lg:col-span-5 space-y-6">
                {/* Active step focal view */}
                <div className="bg-white p-8 rounded-3xl border border-[#e8e2d9] shadow-sm space-y-4">
                  <span className="px-2.5 py-1 text-[10px] font-bold font-sans uppercase tracking-widest text-[#a68a64] bg-[#f5f2ee] rounded-full border border-[#e8e2d9]">
                    {t.activeStepFocus}
                  </span>

                  <div className="pt-2">
                    <h3 className="text-2xl font-serif font-bold text-[#5c4033] leading-tight italic">
                      {timelineRecipe.instructions[activeStepIdx]?.split(":")[0]}
                    </h3>
                    <p className="text-xs font-sans text-[#6b5e4f] mt-2.5 leading-relaxed">
                      {timelineRecipe.instructions[activeStepIdx]?.split(":").slice(1).join(":")}
                    </p>
                  </div>

                  {/* Sourdough Master Interactive Timer */}
                  <div className="bg-[#f5f2ee] border border-[#e8e2d9] p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-xs font-bold font-sans uppercase tracking-wider text-[#5c4033] flex items-center gap-1.5">
                        <Timer className="w-4 h-4 text-[#a68a64]" /> {t.timerLabel}
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8c7e6d]">
                        {t.cycleLabel}
                      </span>
                    </div>

                    <div className="text-center py-2 bg-white/80 border border-[#e8e2d9] rounded-xl shadow-sm">
                      <div className="text-3xl font-mono font-extrabold tracking-widest text-[#5c4033] transition duration-200">
                        {formatTimer(timerSeconds)}
                      </div>
                      <p className="text-[10px] font-sans text-[#8c7e6d] mt-1">{t.timerSub}</p>
                    </div>

                    <div className="flex gap-2">
                      {/* Play/Pause */}
                      <button
                        id="timer-play-btn"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`flex-2 flex items-center justify-center gap-1.5 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer text-center ${
                          isTimerRunning ? "bg-[#a68a64] hover:bg-[#8c734e] text-white" : "bg-[#5c4033] hover:bg-[#4a342a] text-white"
                        }`}
                      >
                        {isTimerRunning ? (
                          <>
                            <Pause className="w-3.5 h-3.5" /> {t.pauseBtn}
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 animate-pulse" /> {t.startTimerBtn}
                          </>
                        )}
                      </button>

                      {/* Reset */}
                      <button
                        id="timer-reset-btn"
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimerSeconds(1800); // Reset to 30 mins
                        }}
                        className="py-3 px-4 rounded-full border border-[#e8e2d9] bg-white text-xs font-bold text-[#5c4033] hover:bg-[#f5f2ee] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {/* Fast Forward for Testing */}
                      <button
                        id="timer-fastforward-btn"
                        onClick={() => {
                          setTimerSeconds(5);
                        }}
                        className="py-3 px-3 bg-white hover:bg-[#f5f2ee] border border-[#e8e2d9] rounded-full text-[9px] font-mono text-[#8c7e6d] shrink-0 cursor-pointer"
                      >
                        {t.skipBtn}
                      </button>
                    </div>
                  </div>

                  {/* SBF Checklist */}
                  <div className="pt-2 border-t border-dashed border-[#e8e2d9]">
                    <p className="text-xs font-bold text-[#5c4033] uppercase tracking-wider">{t.perfectDoughLabel}</p>
                    <ul className="text-[11px] font-sans text-[#6b5e4f] space-y-2 mt-3 font-semibold">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#a68a64] shrink-0" />
                        {t.checklist1}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#a68a64] shrink-0" />
                        {t.checklist2}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#a68a64] shrink-0" />
                        {t.checklist3}
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Micro educational banner */}
                <div className="bg-[#f5f2ee] p-5 rounded-2xl border border-dashed border-[#e8e2d9] flex items-start gap-4 shadow-sm">
                  <Wheat className="w-5 h-5 text-[#a68a64] mt-0.5 shrink-0" />
                  <div className="text-xs font-sans text-[#6b5e4f] leading-relaxed">
                    <span className="font-bold text-[#5c4033] uppercase tracking-wider text-[10px] block mb-1">{t.didYouKnowTitle}</span> {t.didYouKnowDesc}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== TAB 5: AI BAKING ASSISTANT ==================== */}
          {activeTab === "assistant" && (
            <motion.div
              key="assistant-hub"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Sourdough Master Chat Interface */}
              <div
                id="ai-chat-card"
                className="lg:col-span-8 bg-white p-8 rounded-3xl border border-[#e8e2d9] shadow-sm flex flex-col justify-between h-[550px] relative overflow-hidden"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    processFile(file);
                  }
                }}
              >
                {/* Drag and Drop visual overlay */}
                {isDragging && (
                  <div className="absolute inset-0 bg-[#5c4033]/15 backdrop-blur-[2px] border-2 border-dashed border-[#5c4033] rounded-3xl flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-[#fcfaf7] px-6 py-4 rounded-2xl shadow-md border border-[#e8e2d9] flex flex-col items-center gap-2">
                      <UploadCloud className="w-8 h-8 text-[#5c4033] animate-bounce" />
                      <span className="text-xs font-bold font-serif text-[#5c4033]">
                        {t.dragAndDropPrompt}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between border-b border-[#e8e2d9] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#5c4033] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        🍞
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-[#5c4033]">{t.assistantHeading}</h3>
                        <p className="text-[10px] text-[#a68a64] font-bold font-sans uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-[#5c4033] animate-ping" />
                          {t.activeBakerStatus}
                        </p>
                      </div>
                    </div>

                    <button
                      id="reset-chat-btn"
                      onClick={() => {
                        setMessages([
                          {
                            role: "assistant",
                            content: lang === "en"
                              ? "Greetings, young baker! I am the Levain Sourdough Master. 🍞✨\n\nNatural slow fermentation is a beautiful dialogue between flour, water, temperature, and wild yeasts. Today are we going to feed your Levain or start a recipe?"
                              : "Saudações, jovem mestre padeiro! Eu sou o Mestre do Sourdough de Fermentação Natural. 🍞✨\n\nA fermentação natural lenta é um lindo diálogo entre farinha, água pura, temperatura ambiente e leveduras selvagens. Hoje vamos alimentar o seu Levain ou vamos iniciar alguma receita?"
                          }
                        ]);
                        setAttachedImage(null);
                      }}
                      className="p-2 text-[#8c7e6d] hover:bg-[#f5f2ee] rounded-full hover:text-[#5c4033] font-sans text-xs flex items-center gap-1.5 transition-colors font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> {t.clearConversation}
                    </button>
                  </div>
                </div>

                {/* Chat Stream message scroll container */}
                <div id="chat-messages-container" className="flex-1 overflow-y-auto my-4 space-y-4 pr-2">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      id={`chat-message-${idx}`}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-xs leading-relaxed shadow-sm ${
                          m.role === "user"
                            ? "bg-[#5c4033] text-[#fcfaf7] rounded-br-none"
                            : "bg-[#f5f2ee] text-[#4a3f35] rounded-bl-none border border-[#e8e2d9]"
                        }`}
                      >
                        <p className={`font-sans font-bold text-[10px] uppercase tracking-wider mb-1.5 ${m.role === "user" ? "text-white/70" : "text-[#8c7e6d]"}`}>
                          {m.role === "user" ? t.placeholderUser : t.placeholderMaster}
                        </p>
                        
                        {/* Display message image if present */}
                        {m.image && (
                          <div className="mb-2 mt-1 max-w-xs overflow-hidden rounded-xl border border-[#e8e2d9]/10 shadow-sm bg-black/5">
                            <img
                              src={m.image.base64}
                              alt={m.image.name}
                              className="max-h-48 object-cover w-full rounded-xl"
                            />
                          </div>
                        )}

                        {m.role === "user" ? (
                          <div className="whitespace-pre-wrap">{m.content}</div>
                        ) : (
                          <SourdoughMarkdownRenderer content={m.content} />
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing placeholder loader */}
                  {isAiLoading && (
                    <div id="ai-typing-loader" className="flex justify-start">
                      <div className="max-w-[85%] bg-[#f5f2ee] text-[#4a3f35] rounded-2xl rounded-bl-none px-5 py-4 border border-[#e8e2d9] space-y-1.5">
                        <p className="font-sans font-bold text-[10px] uppercase tracking-wider text-[#8c7e6d]">{t.placeholderMaster}</p>
                        <div className="flex items-center gap-1 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5c4033] animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5c4033] animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5c4033] animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Local image preview block before the input area */}
                {attachedImage && (
                  <div className="mb-3 flex items-center justify-between p-2.5 bg-[#f5f2ee] rounded-xl border border-[#e8e2d9] animate-fade-in">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#e8e2d9] bg-white">
                        <img
                          src={attachedImage.base64}
                          alt={attachedImage.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-bold text-[#5c4033] truncate">{attachedImage.name}</p>
                        <p className="text-[9px] text-[#8c7e6d] font-semibold">{t.imageAttached}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="p-1.5 hover:bg-[#e8e2d9] rounded-full text-[#c2410c] hover:text-[#9a3412] transition-colors cursor-pointer"
                      title={lang === "en" ? "Remove" : (lang === "es" ? "Eliminar" : "Remover")}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Bottom message input field */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    id="attach-file-btn"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 bg-[#f5f2ee] hover:bg-[#e8e2d9] text-[#5c4033] border border-[#e8e2d9] rounded-xl transition-colors shadow-sm shrink-0 flex items-center justify-center cursor-pointer"
                    title={t.uploadButton}
                    disabled={isAiLoading}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <input
                    id="ai-text-input-field"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    placeholder={t.inputPlaceholder}
                    className="flex-1 text-xs bg-[#fcfaf7] border border-[#e8e2d9] rounded-xl px-5 py-4 focus:outline-none focus:ring-1 focus:ring-[#5c4033] shadow-inner font-sans text-[#4a3f35]"
                    disabled={isAiLoading}
                  />
                  <button
                    id="submit-ai-prompt-btn"
                    onClick={() => handleSendMessage()}
                    className="p-4 bg-[#5c4033] hover:bg-[#4a342a] text-[#fcfaf7] rounded-xl transition-colors shadow-sm shrink-0 disabled:opacity-50 cursor-pointer"
                    disabled={isAiLoading}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Hot troubleshooting quick triggers */}
              <div id="quick-troubleshooting-card" className="lg:col-span-4 bg-[#f5f2ee] p-8 rounded-3xl border border-dashed border-[#e8e2d9] space-y-4">
                <h4 className="text-sm font-sans font-bold uppercase tracking-wider text-[#5c4033] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#a68a64]" /> {t.beginnerFaqTitle}
                </h4>
                <p className="text-[11px] font-sans text-[#6b5e4f] leading-relaxed">
                  {t.beginnerFaqSub}
                </p>

                <div className="space-y-3 pt-2">
                  <button
                    id="faq-btn-acetone-starter"
                    onClick={() => handleSendMessage(
                      lang === "en"
                        ? "My sourdough starter smells intensely like acetone or paint thinner. Is it ruined and how do I save it?"
                        : "Meu fermento natural (levain) está com cheiro forte de acetona ou removedor de esmalte. Ele estragou de vez ou ainda dá para recuperar? Como faço?"
                    )}
                    className="w-full text-left p-4 bg-white border border-[#e8e2d9] rounded-2xl hover:border-[#5c4033] hover:bg-white text-xs font-bold text-[#4a3f35] hover:text-[#5c4033] transition-all shadow-sm cursor-pointer"
                  >
                    {t.faq1}
                  </button>

                  <button
                    id="faq-btn-no-oven-ear"
                    onClick={() => handleSendMessage(
                      lang === "en"
                        ? "Why doesn't my loaf open up with an attractive 'ear' (score mark flap)? Is it shaping tension or oven steam?"
                        : "Por que meu pão não abre aquela 'pestana' ou 'orelha' linda em cima do corte? É falta de tensão na modelagem ou falta de vapor no forno?"
                    )}
                    className="w-full text-left p-4 bg-white border border-[#e8e2d9] rounded-2xl hover:border-[#5c4033] hover:bg-white text-xs font-bold text-[#4a3f35] hover:text-[#5c4033] transition-all shadow-sm cursor-pointer"
                  >
                    {t.faq2}
                  </button>

                  <button
                    id="faq-btn-sticky-dough"
                    onClick={() => handleSendMessage(
                      lang === "en"
                        ? "The sourdough dough is incredibly sticky and wet. Every time I shape it, it turns into a puddle. How do I build structural tension?"
                        : "A massa está super mole, grudenta e líquida. Na hora de modelar ela vira uma poça rasteira. Como faço para dar estrutura e força ao glúten?"
                    )}
                    className="w-full text-left p-4 bg-white border border-[#e8e2d9] rounded-2xl hover:border-[#5c4033] hover:bg-white text-xs font-bold text-[#4a3f35] hover:text-[#5c4033] transition-all shadow-sm cursor-pointer"
                  >
                    {t.faq3}
                  </button>

                  <button
                    id="faq-btn-no-crumb"
                    onClick={() => handleSendMessage(
                      lang === "en"
                        ? "Explain the exact differences between underproofed and overproofed sourdough. How do my crumb holes and dome height change?"
                        : "Quais são as diferenças reais de aparência entre um pão subfermentado (underproofed) e superfermentado (overproofed)? Como fica o miolo e o crescimento?"
                    )}
                    className="w-full text-left p-4 bg-white border border-[#e8e2d9] rounded-2xl hover:border-[#5c4033] hover:bg-white text-xs font-bold text-[#4a3f35] hover:text-[#5c4033] transition-all shadow-sm cursor-pointer"
                  >
                    {t.faq4}
                  </button>

                  <button
                    id="faq-btn-fed-levain"
                    onClick={() => handleSendMessage(
                      lang === "en"
                        ? "What flour is best to feed my levain starter? Should I use unbleached bread flour, organic whole wheat, or stoneground rye?"
                        : "Qual é a melhor farinha para alimentar meu fermento levain? Devo usar farinha branca comum, integral de trigo ou centeio integral?"
                    )}
                    className="w-full text-left p-4 bg-white border border-[#e8e2d9] rounded-2xl hover:border-[#5c4033] hover:bg-white text-xs font-bold text-[#4a3f35] hover:text-[#5c4033] transition-all shadow-sm cursor-pointer"
                  >
                    {t.faq5}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Aesthetic Sourdough Recipe Footnote */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 mt-20 pt-10 border-t border-[#e8e2d9] text-center">
        <p className="font-serif italic text-base text-[#8c7e6d] leading-relaxed">{t.footerQuote}</p>
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] mt-3 text-[#a68a64]">{t.footerCopyright}</p>
      </footer>
    </div>
  );
}
