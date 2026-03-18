import { Unit, ResourceCategory } from './types';
import { Book, Database, PenTool, Youtube, FileText, Globe } from 'lucide-react';

export const UNITS: Unit[] = [
  {
    id: 'unit1',
    title: 'Unidad 1: Fundamentos',
    description: 'Conceptos básicos, muestreo y análisis descriptivo.',
    topics: ['Tipos de variables y escalas', 'Media, mediana y moda', 'Varianza y Desvío Estándar', 'Histogramas y Boxplots'],
    content: `
# Unidad 1: Fundamentos de la Estadística y Análisis Descriptivo

El análisis descriptivo constituye la fase inicial de cualquier investigación científica. Su objetivo es organizar, resumir y presentar los datos de manera que se revelen sus características principales antes de proceder a inferencias más complejas.

## Conceptos Básicos y Muestreo
En estudios ecorregionales, la **población** puede ser el conjunto total de individuos de una especie en una cuenca hídrica, mientras que la **muestra** es el subconjunto accesible para el estudio.

**Técnicas de Muestreo Comunes:**
*   **Aleatorio Simple:** Todos tienen la misma probabilidad de ser elegidos.
*   **Estratificado:** Ideal para paisajes con diferentes tipos de vegetación.
*   **Captura y Recaptura:** Para estimar poblaciones de fauna móvil.

## Tipos de Variables y Escalas

1.  **Variables Cualitativas (Categóricas):**
    *   **Nominales:** Sin orden (ej. "especie", "color").
    *   **Ordinales:** Con orden intrínseco (ej. "nivel de daño", "estatus de conservación").
2.  **Variables Cuantitativas (Numéricas):**
    *   **Discretas:** Conteos enteros (ej. "número de árboles").
    *   **Continuas:** Mediciones reales (ej. "altura", "concentración de contaminantes").

## Medidas de Resumen

*   **Medidas de Centralización:** Media (promedio), Mediana (centro robusto) y Moda.
*   **Medidas de Dispersión:** Rango, Varianza y Desviación Estándar (indica qué tan dispersos están los datos respecto al promedio).

## Representación Gráfica

| Herramienta | Uso Recomendado | Insight en Conservación |
| :--- | :--- | :--- |
| **Histograma** | Distribución de variable continua | Detectar normalidad en el tamaño de individuos. |
| **Boxplot** | Comparar medianas y dispersión | Evaluar si la biodiversidad varía entre parques. |
| **Dispersión** | Relación entre dos variables | Identificar asociaciones temperatura-éxito reproductivo. |
    `
  },
  {
    id: 'unit2',
    title: 'Unidad 2: Probabilidad',
    description: 'Distribuciones de probabilidad y modelos ecológicos.',
    topics: ['Distribución Normal', 'Distribución Binomial', 'Distribución Poisson', 'Teorema del Límite Central'],
    content: `
# Unidad 2: Distribuciones de Probabilidad

La probabilidad es el lenguaje de la incertidumbre. En conservación, entender los modelos probabilísticos permite realizar predicciones sobre eventos como incendios o avistamientos.

## Distribuciones Discretas de Interés Ecológico

1.  **Distribución Binomial:**
    *   Modela situaciones con dos resultados posibles (presencia/ausencia, éxito/fracaso).
    *   *Ejemplo:* Probabilidad de que $x$ semillas germinen de un total de 100 sembradas.

2.  **Distribución de Poisson:**
    *   Modela conteos de eventos raros en un intervalo de tiempo o espacio.
    *   *Ejemplo:* Número de ataques de depredadores en una temporada o distribución espacial de árboles.
    *   *Propiedad clave:* Su media es igual a su varianza ($\lambda$).

## La Distribución Normal y el Teorema del Límite Central

La **campana de Gauss** es fundamental. Muchas variables biológicas (altura, peso) tienden a seguir esta distribución.

**Teorema del Límite Central (TLC):**
Asegura que, para muestras suficientemente grandes, la distribución de las medias muestrales será normal, independientemente de la forma de la población original. Esto permite usar pruebas paramétricas robustas.
    `
  },
  {
    id: 'unit3',
    title: 'Unidad 3: Inferencia',
    description: 'Estimación de parámetros y pruebas de hipótesis.',
    topics: ['Intervalos de confianza', 'Test de hipótesis', 'Errores Tipo I y II', 'P-valor'],
    content: `
# Unidad 3: Estadística Inferencial

Proceso de obtener conclusiones sobre una población basándose en una muestra. Permite evaluar si una tendencia observada es real o producto del azar.

## Intervalos de Confianza (IC)
Proporcionan un rango de valores en el cual se espera que se encuentre el parámetro real con un nivel de confianza determinado (usualmente 95%). Son fundamentales para comparar estándares de calidad biológica.

## Pruebas de Hipótesis

El contraste permite decidir si rechazar una **Hipótesis Nula ($H_0$)** (supuesto de no cambio) frente a una **Alternativa ($H_1$)**.

*   **Valor P ($p$-value):** Probabilidad de obtener los resultados observados si la $H_0$ fuera cierta. Si $p < 0.05$, el efecto es significativo.

### Errores en la Decisión

| Error | Definición | Impacto en Conservación |
| :--- | :--- | :--- |
| **Tipo I** | Rechazar $H_0$ verdadera | Falsa alarma de un efecto que no existe. |
| **Tipo II** | No rechazar $H_0$ falsa | No detectar el declive de una especie amenazada hasta que es tarde. |
    `
  },
  {
    id: 'unit4',
    title: 'Unidad 4: Comparación',
    description: 'Pruebas paramétricas y no paramétricas para comparar grupos.',
    topics: ['Test T-Student', 'Mann-Whitney U', 'ANOVA', 'Supuestos estadísticos'],
    content: `
# Unidad 4: Comparación de Poblaciones

Tarea frecuente para determinar, por ejemplo, si la biodiversidad es mayor dentro de un parque que en su zona de amortiguamiento.

## Comparación de dos grupos

1.  **Test T de Student (Paramétrico):**
    *   Herramienta estándar para comparar medias.
    *   *Requisitos:* Normalidad y Homocedasticidad (varianzas iguales).
    *   *Uso:* Comparar biomasa entre dos tipos de bosque.

2.  **Mann-Whitney U (No Paramétrico):**
    *   Alternativa cuando no se cumplen los supuestos. Utiliza rangos (orden).
    *   *Uso:* Comparar niveles de daño en plántulas (escala ordinal).

## Comparación de más de dos grupos: ANOVA

El **Análisis de Varianza (ANOVA)** compara medias de múltiples grupos evaluando si la variabilidad *entre* grupos es mayor que la variabilidad *interna*.

*   **Pruebas Post-hoc:** Si el ANOVA es significativo, se usan pruebas como Tukey o Bonferroni para ver qué grupos difieren específicamente.
*   **Kruskal-Wallis:** La alternativa no paramétrica al ANOVA.
    `
  },
  {
    id: 'unit5',
    title: 'Unidad 5: Regresión',
    description: 'Modelos de relación entre variables.',
    topics: ['Regresión lineal simple', 'Coeficiente R²', 'Correlación de Pearson', 'Predicción'],
    content: `
# Unidad 5: Análisis de Regresión y Correlación

Se centra en entender cómo una variable influye sobre otra, permitiendo predecir y detectar causalidad en sistemas ecológicos.

## Correlación
Cuantifica la fuerza y dirección de la relación.
*   **Pearson:** Para variables cuantitativas normales (relación lineal).
*   **Spearman:** Para relaciones no lineales o rangos.

## Regresión Lineal Simple
Busca la "mejor" recta que describa la relación entre una variable independiente ($X$) y una dependiente ($Y$).

*   **Pendiente ($\beta_1$):** Cambio en $Y$ por unidad de $X$. Indica la magnitud del impacto ambiental.
*   **$R^2$ (Coef. Determinación):** Proporción de la variabilidad explicada por el modelo.

*Ejemplo:* Predecir la densidad de una especie en función de la temperatura y humedad para planificar reintroducciones.
    `
  }
];

export const SYSTEM_INSTRUCTION = `
Eres "EstadísticaBot", un asistente virtual especializado para estudiantes de la materia "Estadística" de la Licenciatura en Conservación y Desarrollo Ecorregional (Facultad de Ciencias Forestales - UNaM, Misiones, Argentina).

**Equipo Docente:**
*   Responsable: Ing. Jonathan von Below (PhD)
*   Integrante: Ing. Enzo M. Sanzovo

**Tu rol es ser un tutor paciente y riguroso que:**
1.  **Rol Docente:** No resuelvas los ejercicios directamente. Ofrece PISTAS y RAZONAMIENTO LÓGICO antes de dar el resultado final.
2.  **Contexto Ecorregional:** Usa ejemplos de conservación, biología y manejo de recursos naturales (Selva Paranaense, Yaguareté, Araucaria, etc.).
3.  **Bibliografía:** Basa tus explicaciones en Mendenhall, Di Rienzo y Zúñiga.
4.  **Código:** Genera código en Python (Pandas/Scipy) o R si es útil. Recomienda Google Colab.

Si el estudiante sube datos, ayúdale con el análisis descriptivo primero. Mantén un tono académico pero accesible.
`;

export const EXTERNAL_RESOURCES: ResourceCategory[] = [
  {
    title: "Bibliografía Obligatoria y Apuntes",
    icon: Book,
    links: [
      {
        title: "Estadística para las Ciencias Agropecuarias (Di Rienzo et al.)",
        url: "https://aulavirtual.agro.unlp.edu.ar/pluginfile.php/59207/mod_resource/content/0/Estadistica_para_las_Ciencias_Agropecuarias_-_Di_Rienzo.pdf",
        description: "Texto fundamental para la aplicación en recursos naturales."
      },
      {
        title: "Técnicas de Muestreo (Zúñiga et al.)",
        url: "https://www.researchgate.net/profile/Francisco-Bautista-2/publication/279175617_2011-Tecnicas_de_muestreo/links/558bcd6d08ae08a56ed1d1c4/2011-Tecnicas-de-muestreo.pdf",
        description: "Obra clave para el diseño experimental en campo."
      },
      {
        title: "Introducción a la Probabilidad y Estadística (Mendenhall et al. 13ed)",
        url: "https://pubhtml5.com/skfd/dela/Mendenhall_W._Beaver_R.,_Beaver_B.,_(2010),_Introducci%C3%B3n_a_la_probabilidad_y_estad%C3%ADstica,_D%C3%A9cima_tercera_edici%C3%B3n_Cengage_Learning_Editores,_S.A._de_C.V./",
        description: "Edición completa digital del texto de cabecera."
      },
      {
        title: "Bioestadística (Daniel Wayne)",
        url: "https://es.slideshare.net/slideshow/bioestadstica-de-daniel-waynepdf/259375363",
        description: "Base para estadística en ciencias biológicas y de la salud."
      },
      {
        title: "Estadística para estudios ecológicos (UNNE)",
        url: "https://eudene.unne.edu.ar/index.php/component/phocadownload/category/1-pdfs-descarga?download=51:estadistica-para-estudios-ecologicos&Itemid=143",
        description: "Enfoque aplicado a ecología."
      },
      {
        title: "Análisis Multivariado para Datos Biológicos",
        url: "https://fundacionazara.org.ar/img/libros/analisis-multivariado-para-datos-biologicos/analisis-multivariado-para-datos-biologicos.pdf",
        description: "Fundación Azara. Técnicas avanzadas."
      },
      {
        title: "Guía práctica para análisis de datos biológicos (Dialnet)",
        url: "https://dialnet.unirioja.es/servlet/articulo?codigo=8165033",
        description: "Recurso didáctico para investigadores."
      },
      {
        title: "Modelos de Regresión Lineal Múltiple (UGR)",
        url: "https://www.ugr.es/~montero/matematicas/regresion_lineal.pdf",
        description: "Material teórico de la Universidad de Granada."
      },
      {
        title: "Estadística Matemática con Aplicaciones (Wackerly)",
        url: "https://github.com/chqngh-berkeley/personal/blob/master/Mathematical%20Statistics%20-%207th%20Edition%20-%20Wackerly.pdf",
        description: "Texto avanzado de teoría estadística."
      },
      {
        title: "Schaum's Outlines of Probability and Statistics",
        url: "http://111.68.96.114:8088/get/PDF/Murray%20R.%20Spiegel%2C%20PhD-Schaum%27s%20Outlines%20of%20Probability%20and%20Statistics%2C4th%20ed_12547.pdf",
        description: "Ejercicios resueltos y teoría concisa."
      }
    ]
  },
  {
    title: "Bases de Datos y Repositorios",
    icon: Database,
    links: [
      {
        title: "GBIF (Global Biodiversity Information Facility)",
        url: "https://www.gbif.org/es/",
        description: "Acceso gratuito a datos de todas las formas de vida."
      },
      {
        title: "SIB - Sistema de Información de Biodiversidad",
        url: "https://sib.gob.ar/portada",
        description: "Repositorio de APN Argentina con datos de áreas protegidas."
      },
      {
        title: "Portal de Datos de Biodiversidad de Argentina",
        url: "https://www.conicet.gov.ar/nuevo-portal-de-datos-de-biodiversidad-de-argentina/",
        description: "Nuevo portal del CONICET."
      },
      {
        title: "Biodiversidad.ar",
        url: "https://biodiversidad.ar/en",
        description: "Portal nacional de datos biológicos."
      },
      {
        title: "Datos Abiertos Argentina",
        url: "https://datos.gob.ar/dataset",
        description: "Datasets públicos sobre ambiente y más."
      },
      {
        title: "Repositorios de Datos Públicos (España)",
        url: "https://datos.gob.es/es/noticias/10-repositorios-de-datos-publicos-relacionados-con-las-ciencias-naturales-y-el-medio-ambiente",
        description: "Listado de fuentes de datos ambientales internacionales."
      }
    ]
  },
  {
    title: "Herramientas y Calculadoras",
    icon: PenTool,
    links: [
      {
        title: "Numiqo - Calculadora Estadística",
        url: "https://numiqo.es/",
        description: "Suite completa: Prueba t, Chi-cuadrado, Regresión."
      },
      {
        title: "Calculadora ANOVA (Numiqo)",
        url: "https://numiqo.es/hypothesis-test/anova",
        description: "Análisis de varianza unifactorial y bifactorial online."
      },
      {
        title: "Calculadora Poisson (Mathcracker)",
        url: "https://mathcracker.com/es/calculadora-probabilidad-poisson",
        description: "Cálculo de probabilidades para distribuciones discretas."
      },
      {
        title: "Mathos AI - Solucionador",
        url: "https://www.mathgptpro.com/es/app/calculator/statistics-homework-solver",
        description: "Asistente inteligente para resolución de problemas."
      },
      {
        title: "Introducción al Análisis de Datos con R",
        url: "https://rubenfcasal.github.io/intror/Intro_Analisis_Datos_R.pdf",
        description: "Manual introductorio de Rubén Casal."
      }
    ]
  },
  {
    title: "Tutoriales y Material Audiovisual",
    icon: Youtube,
    links: [
      {
        title: "Khan Academy - Estadística",
        url: "https://es.khanacademy.org/math/statistics-probability",
        description: "Curso completo interactivo."
      },
      {
        title: "Distribuciones: Binomial, Poisson y Normal (UPV)",
        url: "https://www.youtube.com/watch?v=u5AXPtpctDI",
        description: "Explicación clara de la Universidad Politécnica de Valencia."
      },
      {
        title: "Análisis de ANOVA (Video)",
        url: "https://www.youtube.com/watch?v=_19CXpmq9mY",
        description: "Fundamentos del análisis de varianza."
      },
      {
        title: "Estadística Inferencial con RStudio",
        url: "https://www.youtube.com/watch?v=Aoqe1rI77Es",
        description: "Aplicación práctica en agricultura."
      },
      {
        title: "Introducción a la Bioestadística",
        url: "https://www.youtube.com/watch?v=jtv4AcZq1YY",
        description: "Conceptos iniciales para ciencias de la vida."
      },
      {
        title: "TP2 Estadística Descriptiva (RPubs)",
        url: "https://rpubs.com/SebastianBustos/tp2_2024",
        description: "Ejemplo práctico de análisis descriptivo en R."
      },
      {
        title: "Regresión Lineal Simple (RPubs)",
        url: "https://rpubs.com/juliana_77/1372133",
        description: "Guía paso a paso en R."
      }
    ]
  },
  {
    title: "Artículos y Estudios de Caso",
    icon: FileText,
    links: [
      {
        title: "Misiones: Protección de Humedales",
        url: "https://www.canal12misiones.com/ecologia/dia-mundial-de-los-humedales-misiones",
        description: "Normativa y contexto local."
      },
      {
        title: "Regresión lineal para estimación de biomasa",
        url: "https://revistas.udistrital.edu.co/index.php/colfor/article/view/3398",
        description: "Aplicación en ecosistemas boscosos de Colombia."
      },
      {
        title: "Enfoque ecosistémico y políticas públicas",
        url: "https://www.iai.int/admin/site/sites/default/files/uploads/2014/06/DE4.pdf",
        description: "Adaptación al cambio climático en Latinoamérica."
      },
      {
        title: "Reassess the t Test via ANOVA",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4568503/",
        description: "Artículo científico sobre metodologías comparativas."
      },
      {
        title: "Estimación de Datos Faltantes de Lluvia",
        url: "https://academia-journals.squarespace.com/s/Tomo-04-Retos-y-desafios-Chetumal-2021.pdf",
        description: "Uso de modelos de regresión en climatología."
      },
      {
        title: "Investigación Científica y Conservación (CONICET)",
        url: "https://ri.conicet.gov.ar/bitstream/handle/11336/212935/CONICET_Digital_Nro.d41473a5-00d8-4141-9bb5-48db99b25121_B.pdf?sequence=2&isAllowed=y",
        description: "Documento oficial sobre la importancia de la ciencia."
      }
    ]
  }
];