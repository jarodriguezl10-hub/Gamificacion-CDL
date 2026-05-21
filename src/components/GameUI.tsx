"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShieldAlert, BrainCircuit, FileText, UserPlus, Flame, CheckCircle, Play, MessageCircle, AlertTriangle, Zap, Clock, Star, HelpCircle, Stethoscope, Archive, Target, BarChart2, Trophy } from "lucide-react";

// --- TIPOS DE DATOS ---
type TaskType = 'urgente' | 'compleja' | 'rutinaria' | 'lider' | 'analisis';

interface Task {
  id: string;
  name: string;
  type: TaskType;
  workRequired: number;
  workDone: number;
  createdAt: number;
  canBeDelayed: boolean;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  stress: number;
  maxStress: number; 
  tasksAssigned: number; 
  currentTask: Task | null;
  bestTask: TaskType | 'all';
  timeSpentWorkingMs: number;
  isBurnedOut: boolean;
  tasksDone: number; 
  isAskingHelp: boolean; 
  isMedical: boolean; 
  medicalTimer: number; 
  isAi?: boolean;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  burnouts: number;
  livesLost: number;
  wrongAssignments: number;
  wrongIcebox: number;
  date: number;
}

// --- CONFIGURACIÓN DEL NIVEL ---
const INITIAL_EMPLOYEES: Employee[] = [
  { id: "e1", name: "Sofía", role: "Experiencia", avatar: "👩‍💼", stress: 0, maxStress: 0, tasksAssigned: 0, currentTask: null, isBurnedOut: false, tasksDone: 0, isAskingHelp: false, isMedical: false, medicalTimer: 0, timeSpentWorkingMs: 0, bestTask: 'compleja' },
  { id: "e3", name: "Mateo", role: "Apaga-incendios", avatar: "👨‍🚒", stress: 0, maxStress: 0, tasksAssigned: 0, currentTask: null, isBurnedOut: false, tasksDone: 0, isAskingHelp: false, isMedical: false, medicalTimer: 0, timeSpentWorkingMs: 0, bestTask: 'urgente' },
  { id: "e4", name: "Valeria", role: "Junior", avatar: "👧", stress: 0, maxStress: 0, tasksAssigned: 0, currentTask: null, isBurnedOut: false, tasksDone: 0, isAskingHelp: false, isMedical: false, medicalTimer: 0, timeSpentWorkingMs: 0, bestTask: 'rutinaria' },
  { id: "ai1", name: "Copilot", role: "Asistente AI", avatar: "🤖", stress: 0, maxStress: 0, tasksAssigned: 0, currentTask: null, isBurnedOut: false, tasksDone: 0, isAskingHelp: false, isMedical: false, medicalTimer: 0, timeSpentWorkingMs: 0, bestTask: 'analisis', isAi: true },
  { id: "ai2", name: "Gemini", role: "Asistente AI", avatar: "🦾", stress: 0, maxStress: 0, tasksAssigned: 0, currentTask: null, isBurnedOut: false, tasksDone: 0, isAskingHelp: false, isMedical: false, medicalTimer: 0, timeSpentWorkingMs: 0, bestTask: 'analisis', isAi: true }
];

const MASTER_TASK_POOL = [
  // ANÁLISIS (Para Asistentes AI)
  { name: "Analizar asistencia confirmada vs esperada", type: "analisis", workRequired: 80, canBeDelayed: false },
  { name: "Detectar retrasos en el cronograma", type: "analisis", workRequired: 90, canBeDelayed: false },
  { name: "Generar alertas de tareas críticas", type: "analisis", workRequired: 70, canBeDelayed: false },
  { name: "Analizar costos acumulados del evento", type: "analisis", workRequired: 100, canBeDelayed: false },
  { name: "Identificar proveedores con incumplimientos", type: "analisis", workRequired: 110, canBeDelayed: false },
  { name: "Generar reportes automáticos diarios", type: "analisis", workRequired: 80, canBeDelayed: false },
  { name: "Predecir posibles cuellos de botella", type: "analisis", workRequired: 120, canBeDelayed: false },
  { name: "Recomendar ajustes logísticos", type: "analisis", workRequired: 90, canBeDelayed: false },
  { name: "Enviar recordatorios automáticos", type: "analisis", workRequired: 60, canBeDelayed: false },
  { name: "Generar minutas de reuniones", type: "analisis", workRequired: 70, canBeDelayed: false },
  { name: "Responder preguntas frecuentes del evento", type: "analisis", workRequired: 50, canBeDelayed: false },
  { name: "Crear listas automáticas de pendientes", type: "analisis", workRequired: 60, canBeDelayed: false },
  { name: "Organizar información de proveedores", type: "analisis", workRequired: 80, canBeDelayed: false },
  { name: "Resumir feedback de asistentes", type: "analisis", workRequired: 90, canBeDelayed: false },
  { name: "Enviar alertas de cambios de agenda", type: "analisis", workRequired: 50, canBeDelayed: false },
  { name: "Generar reportes ejecutivos automáticos", type: "analisis", workRequired: 100, canBeDelayed: false },

  // LÍDER / GERENTE (Tú)
  { name: "Definir presupuesto total del evento", type: "lider", workRequired: 140, canBeDelayed: false },
  { name: "Negociar fechas y contratos con el hotel", type: "lider", workRequired: 150, canBeDelayed: false },
  { name: "Aprobar proveedores de comida y sonido", type: "lider", workRequired: 120, canBeDelayed: false },
  { name: "Coordinar reuniones de seguimiento", type: "lider", workRequired: 100, canBeDelayed: false },
  { name: "Supervisar cumplimiento del cronograma", type: "lider", workRequired: 130, canBeDelayed: false },
  { name: "Resolver conflictos entre proveedores", type: "lider", workRequired: 110, canBeDelayed: false },
  { name: "Validar experiencia final de asistentes", type: "lider", workRequired: 120, canBeDelayed: false },
  { name: "Presentar avances a gerencia general", type: "lider", workRequired: 150, canBeDelayed: false },

  // URGENTES (Para Mateo - Apaga-incendios)
  { name: "Cancelación inesperada de proveedor", type: "urgente", workRequired: 90, canBeDelayed: false },
  { name: "Conseguir transporte adicional urgente", type: "urgente", workRequired: 80, canBeDelayed: false },
  { name: "Manejar quejas urgentes de asistentes", type: "urgente", workRequired: 70, canBeDelayed: false },
  { name: "Resolver fallas de sonido en conferencia", type: "urgente", workRequired: 100, canBeDelayed: false },
  { name: "Solución rápida por retrasos logísticos", type: "urgente", workRequired: 110, canBeDelayed: false },
  { name: "Reubicar personas por falta de sillas", type: "urgente", workRequired: 60, canBeDelayed: false },
  { name: "Atender incidente médico menor", type: "urgente", workRequired: 80, canBeDelayed: false },
  { name: "Respuesta rápida ante problemas climáticos", type: "urgente", workRequired: 120, canBeDelayed: false },

  // COMPLEJAS (Para Sofía - Experiencia)
  { name: "Coordinar logística de transporte", type: "compleja", workRequired: 140, canBeDelayed: false },
  { name: "Revisar lista de invitados y confirmaciones", type: "compleja", workRequired: 130, canBeDelayed: false },
  { name: "Validar montaje del escenario y pantallas", type: "compleja", workRequired: 150, canBeDelayed: false },
  { name: "Coordinar agenda de conferencistas", type: "compleja", workRequired: 160, canBeDelayed: false },
  { name: "Seguimiento a proveedores críticos", type: "compleja", workRequired: 120, canBeDelayed: false },
  { name: "Preparar reportes diarios del avance", type: "compleja", workRequired: 110, canBeDelayed: false },
  { name: "Organizar pruebas de sonido y luces", type: "compleja", workRequired: 140, canBeDelayed: false },
  { name: "Verificar protocolos del evento", type: "compleja", workRequired: 130, canBeDelayed: false },

  // RUTINARIAS - IMPORTANTES (Para Valeria - Junior)
  { name: "Actualizar listas de asistentes", type: "rutinaria", workRequired: 40, canBeDelayed: false },
  { name: "Enviar correos de confirmación", type: "rutinaria", workRequired: 35, canBeDelayed: false },
  { name: "Organizar carpetas y documentos", type: "rutinaria", workRequired: 30, canBeDelayed: false },
  { name: "Registrar pagos a proveedores", type: "rutinaria", workRequired: 45, canBeDelayed: false },
  { name: "Agendar reuniones del equipo", type: "rutinaria", workRequired: 25, canBeDelayed: false },
  { name: "Imprimir escarapelas y material", type: "rutinaria", workRequired: 50, canBeDelayed: false },
  { name: "Actualizar cronogramas básicos", type: "rutinaria", workRequired: 40, canBeDelayed: false },
  { name: "Hacer seguimiento a pendientes simples", type: "rutinaria", workRequired: 30, canBeDelayed: false },

  // RUTINARIAS - PUEDEN RETRASARSE (Icebox)
  { name: "Elegir decoración del salón", type: "rutinaria", workRequired: 30, canBeDelayed: true },
  { name: "Diseñar filtro de Instagram del evento", type: "rutinaria", workRequired: 25, canBeDelayed: true },
  { name: "Crear playlist musical del evento", type: "rutinaria", workRequired: 20, canBeDelayed: true },
  { name: "Elegir colores de las escarapelas", type: "rutinaria", workRequired: 15, canBeDelayed: true },
  { name: "Buscar fotógrafo extra para la gala", type: "rutinaria", workRequired: 35, canBeDelayed: true },
  { name: "Ordenar snacks para el equipo", type: "rutinaria", workRequired: 20, canBeDelayed: true },
  { name: "Publicar post en redes del evento", type: "rutinaria", workRequired: 25, canBeDelayed: true },
  { name: "Ver inspiración en Pinterest para el montaje", type: "rutinaria", workRequired: 15, canBeDelayed: true },
  { name: "Limpiar bandeja de spam", type: "rutinaria", workRequired: 30, canBeDelayed: true },
  { name: "Buscar memes para el chat del equipo", type: "rutinaria", workRequired: 20, canBeDelayed: true },
  { name: "Cambiar fondo de pantalla corporativo", type: "rutinaria", workRequired: 10, canBeDelayed: true },
  { name: "Actualizar foto de perfil", type: "rutinaria", workRequired: 15, canBeDelayed: true },
  { name: "Revisar boletín del sector eventos", type: "rutinaria", workRequired: 25, canBeDelayed: true },
  { name: "Planear fiesta de fin de año", type: "rutinaria", workRequired: 50, canBeDelayed: true },
  { name: "Comprar snacks de oficina", type: "rutinaria", workRequired: 20, canBeDelayed: true },
  { name: "Ver tutorial de Excel básico", type: "rutinaria", workRequired: 45, canBeDelayed: true }
];

const ONE_ON_ONE_SCENARIOS = [
  { 
    q: "Estoy agotado coordinando 15 proveedores a la vez. Siento que voy a colapsar antes del evento.", 
    opts: [
      { t: "Entiendo. Prioricemos juntos: déjame los 3 proveedores críticos a mí y tú focálzate en los demás.", res: "good" }, 
      { t: "Todos estamos así, es la única semana fuerte. Aguanta un poco más.", res: "bad" }, 
      { t: "Si no puedes con todos, asignamos esos proveedores a Mateo mejor.", res: "bad" }
    ] 
  },
  { 
    q: "El proveedor de catering canceló y siento que la culpa recayó sobre mí ante el cliente.", 
    opts: [
      { t: "Eso no fue culpa tuya. Yo hablo con el cliente hoy y juntos buscamos un reemplazo ahora.", res: "good" }, 
      { t: "Sí, debías haberlo confirmado antes. La próxima vez revisa dos veces.", res: "bad" }, 
      { t: "No te preocupes, yo asumo todo con el cliente. Tú descansa.", res: "bad" }
    ] 
  },
  { 
    q: "Me asignaron tareas de logística compleja que no son mi perfil y me frustran mucho.", 
    opts: [
      { t: "Tiene razón. Hoy es contingencia, pero mañana reestructuramos las asignaciones.", res: "good" }, 
      { t: "Es lo que el evento necesita hoy. Tienes que ser más flexible.", res: "bad" }, 
      { t: "Si no te gusta, la tarea la toma otro que sí quiera trabajar.", res: "bad" }
    ] 
  },
  { 
    q: "Los asistentes se quejan directamente conmigo y ya no aguanto más la presión del evento.", 
    opts: [
      { t: "Nadie debe descargarse contigo así. Respira 10 min, yo pongo un canal único de quejas.", res: "good" }, 
      { t: "Es un evento VIP, hay que aguantar. Trata de no tomarlo personal.", res: "bad" }, 
      { t: "Pásame esas quejas, yo las atiendo para que no sufras.", res: "bad" }
    ] 
  },
  { 
    q: "He cometido varios errores en el registro de pagos a proveedores por el estrés del evento.", 
    opts: [
      { t: "Los errores pasan bajo presión. Toma 5 min, luego revisamos juntos los registros críticos.", res: "good" }, 
      { t: "Déjame eso a mí, yo lo reviso para asegurar que esté bien.", res: "bad" }, 
      { t: "Concéntrate más. Un error en los pagos nos puede generar problemas legales.", res: "bad" }
    ] 
  }
];

const SUPPORT_SCENARIOS = [
  { 
    q: "¿Cómo manejo la queja de un asistente VIP que dice que su mesa no fue reservada?", 
    opts: [
      { t: "Llévalo a un área tranquila, verifica la lista y si hay error, ofrécete personalmente a solucionarlo.", res: "good" }, 
      { t: "Díle que espere, que seguramente es un error del sistema y que ya se resolverá.", res: "bad" }, 
      { t: "Díle que la culpa es del proveedor de registro y que hable con ellos.", res: "bad" }
    ] 
  },
  { 
    q: "El sistema de registro digital falló y no puedo validar la entrada de los asistentes.", 
    opts: [
      { t: "Activa el registro manual con las listas impresas y escala el fallo al proveedor técnico ya.", res: "good" }, 
      { t: "Espera unos minutos, estos sistemas se caen solos y se vuelven a levantar.", res: "bad" }, 
      { t: "Para el ingreso hasta que el sistema funcione, no podemos arriesgarnos a errores.", res: "bad" }
    ] 
  },
  { 
    q: "El proveedor de sonido dice que llegará 2 horas tarde. ¿Qué le comunico al cliente?", 
    opts: [
      { t: "Infórmale al cliente con honestidad, ofrece una alternativa temporal y exige compromiso por escrito al proveedor.", res: "good" }, 
      { t: "No le digas nada al cliente todavía, esperemos a ver si el proveedor llega antes.", res: "bad" }, 
      { t: "Díle al cliente que es el tráfico, que es algo fuera de nuestro control.", res: "bad" }
    ] 
  },
  { 
    q: "No entiendo cómo llenar el campo de costos acumulados en el reporte del evento.", 
    opts: [
      { t: "Revisemos el formato juntos 5 minutos para que lo aprendas y puedas hacerlo solo a futuro.", res: "good" }, 
      { t: "Pon un estimado por ahora, lo importante es entregarlo antes de la reunión.", res: "bad" }, 
      { t: "Consulta el manual de procedimientos, no tengo tiempo para cosas operativas ahora.", res: "bad" }
    ] 
  },
  { 
    q: "Un conferencista pide cambios de último minuto en su presentación. ¿Los apruebo?", 
    opts: [
      { t: "Evalúa si afecta la agenda. Si es menor, aprueba. Si cambia el flujo, escala a mí primero.", res: "good" }, 
      { t: "Sí, aprueba todo para no crear conflicto con el conferencista.", res: "bad" }, 
      { t: "No, dile que ya es muy tarde para cambios y que use lo que aprobó antes.", res: "bad" }
    ] 
  },
  { 
    q: "Hay un conflicto entre el proveedor de iluminación y el de sonido por espacio en el escenario.", 
    opts: [
      { t: "Réunelos a los dos, facilita una solución conjunta y documenta el acuerdo.", res: "good" }, 
      { t: "Díle al de sonido que ceda el espacio, ellos llegaron primero.", res: "bad" }, 
      { t: "Díjame eso a mí, yo hablo con los dos ahora mismo.", res: "bad" }
    ] 
  }
];

export default function GameUI() {
  const [leaderName, setLeaderName] = useState("");
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winStatus, setWinStatus] = useState(false);
  
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); 
  const [lives, setLives] = useState(3);
  const [livesLostCount, setLivesLostCount] = useState(0);
  
  const [totalTaskTimeMs, setTotalTaskTimeMs] = useState(0);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [backlog, setBacklog] = useState<Task[]>([]);
  const [icebox, setIcebox] = useState<Task[]>([]);
  const [taskPool, setTaskPool] = useState<any[]>([]);

  const [completedTasks, setCompletedTasks] = useState(0);
  const [generatedTasks, setGeneratedTasks] = useState(1);
  const [wrongAssignments, setWrongAssignments] = useState(0); 
  const [badAnswers, setBadAnswers] = useState(0);
  const [leaderRutinarias, setLeaderRutinarias] = useState(0);
  const [wrongAiAssignments, setWrongAiAssignments] = useState(0);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<{empId: string, questions: any[], type: '1:1' | 'help'} | null>(null);
  const [lifeLostModal, setLifeLostModal] = useState<number | null>(null);

  // Pool de preguntas barajadas
  const [pool1on1, setPool1on1] = useState<any[]>([]);
  const [poolHelp, setPoolHelp] = useState<any[]>([]);
  
  const stateRef = useRef({ employees, backlog, icebox, lives, timeLeft, totalTaskTimeMs, taskPool, wrongAssignments, generatedTasks, wrongAiAssignments });
  useEffect(() => {
    stateRef.current = { employees, backlog, icebox, lives, timeLeft, totalTaskTimeMs, taskPool, wrongAssignments, generatedTasks, wrongAiAssignments };
  }, [employees, backlog, icebox, lives, timeLeft, totalTaskTimeMs, taskPool, wrongAssignments, generatedTasks, wrongAiAssignments]);

  const ticksRef = useRef(0);

  const shuffle = (array: any[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  // Game Loop
  useEffect(() => {
    if (!isPlaying || isGameOver || activeModal || lifeLostModal !== null) return;

    const gameLoop = setInterval(() => {
      ticksRef.current += 1;
      const currentTicks = ticksRef.current;
      
      const { employees: currentEmps, backlog: currentBacklog, lives: currentLives, taskPool: currentPool, generatedTasks: currentGenerated } = stateRef.current;
      let newBacklog = [...currentBacklog];
      let newPool = [...currentPool];
      let newCompleted = 0;
      let newScore = 0;
      let newLives = currentLives;
      let addedGlobalTime = 0;
      let newGenerated = currentGenerated;

      // Evento Especial: Cita médica al minuto 1 (Tick 600, quedan 60s) — solo humanos, nunca AI
      if (currentTicks === 600) {
         const availableEmps = currentEmps.filter(e => e.id !== "leader" && !e.isMedical && !e.isAi);
         if (availableEmps.length > 0) {
            const unluckyEmp = availableEmps[Math.floor(Math.random() * availableEmps.length)];
            const empIdx = currentEmps.findIndex(e => e.id === unluckyEmp.id);
            if (unluckyEmp.currentTask) {
               newBacklog.push(unluckyEmp.currentTask); 
               currentEmps[empIdx].currentTask = null;
            }
            currentEmps[empIdx].isMedical = true;
            currentEmps[empIdx].medicalTimer = 100; // 10 segundos
         }
      }

      const spawnTask = () => {
        if (newPool.length > 0) {
          const nextTaskBase = newPool.pop();
          newBacklog.push({ ...nextTaskBase, id: Math.random().toString(36).substr(2, 9) + Date.now(), workDone: 0, createdAt: Date.now() } as Task);
          newGenerated += 1;
        }
      };

      // 1 tarea cada 6 segundos (60 ticks) + 2 adicionales cada 20 segundos (200 ticks)
      if (currentTicks % 60 === 0) spawnTask();
      if (currentTicks % 200 === 0) {
        spawnTask();
        spawnTask();
      }

      // Penalización por 13 tareas
      if (newBacklog.length >= 13) {
        newLives -= 1;
        setLivesLostCount(prev => prev + 1);
        let toRemove = 7;
        while (toRemove > 0 && newBacklog.length > 0) {
           const randomIndex = Math.floor(Math.random() * newBacklog.length);
           newBacklog.splice(randomIndex, 1);
           toRemove--;
        }
        setLives(newLives);
        setBacklog([...newBacklog]);
        setEmployees([...currentEmps]);
        setTaskPool(newPool);
        
        if (newLives <= 0) {
          setIsGameOver(true);
          setWinStatus(false);
          return;
        } else {
          setLifeLostModal(newLives);
          return;
        }
      }

      const newEmployees = currentEmps.map(emp => {
        if (emp.isMedical) {
          if (emp.medicalTimer > 0) {
            return { ...emp, medicalTimer: emp.medicalTimer - 1 };
          } else {
            return { ...emp, isMedical: false };
          }
        }
        
        if (emp.tasksDone >= 15 && emp.id !== "leader") return emp;
        if (emp.isBurnedOut) return emp;
        if (emp.isAskingHelp) return emp;

        if (emp.currentTask) {
          const taskType = emp.currentTask.type;
          let progressStep = 1.0;
          let stressStep = 0.6;

          if (emp.id === "leader") {
            if (taskType === 'lider') {
              progressStep = 3.5; stressStep = 0.5;
            } else {
              progressStep = 2.0; stressStep = 0.8;
            }
          } else {
            if (taskType === emp.bestTask) {
              progressStep = 3.0; stressStep = 0.2; 
            } else {
              progressStep = 0.5; stressStep = 3.5;
            }
          }

          if (emp.isAi) {
            progressStep *= 2.0;
            stressStep = 0.0;
          }

          const newWorkDone = emp.currentTask.workDone + progressStep;
          const newStress = Math.min(100, emp.stress + stressStep);
          const newMaxStress = Math.max(emp.maxStress, newStress);

          // Si la tarea es del tipo incorrecto para un humano, pide 1:1 con más frecuencia
          const isWrongTask = taskType !== emp.bestTask;
          const helpChance = isWrongTask ? 0.035 : 0.004;
          const burnoutChance = isWrongTask ? 0.008 : 0.002;

          if (Math.random() < helpChance && emp.id !== "leader" && !emp.isAi) {
            return { ...emp, isAskingHelp: true, stress: newStress, maxStress: newMaxStress };
          }

          if (Math.random() < burnoutChance && emp.id !== "leader" && !emp.isAi) {
            newBacklog.push(emp.currentTask);
            return { ...emp, isBurnedOut: true, currentTask: null, stress: 100, maxStress: 100 };
          }

          if (newStress >= 100 && !emp.isAi) {
            newBacklog.push(emp.currentTask);
            return { ...emp, isBurnedOut: true, currentTask: null, stress: 100, maxStress: 100 }; 
          }

          if (newWorkDone >= emp.currentTask.workRequired) {
            newCompleted += 1;
            const timeTaken = Date.now() - emp.currentTask.createdAt;
            addedGlobalTime += timeTaken;
            newScore += (taskType === 'urgente' ? 30 : taskType === 'compleja' ? 50 : taskType === 'lider' ? 100 : 10);
            
            return { 
              ...emp, 
              currentTask: null, 
              stress: newStress, 
              maxStress: newMaxStress,
              tasksDone: emp.tasksDone + 1,
              timeSpentWorkingMs: emp.timeSpentWorkingMs + timeTaken
            };
          }

          return { ...emp, stress: newStress, maxStress: newMaxStress, currentTask: { ...emp.currentTask, workDone: newWorkDone } };
        }

        return { ...emp, stress: Math.max(0, emp.stress - 0.5) };
      });

      setEmployees(newEmployees);
      setBacklog(newBacklog);
      setTaskPool(newPool);
      if (newGenerated > currentGenerated) setGeneratedTasks(newGenerated);
      
      if (addedGlobalTime > 0) setTotalTaskTimeMs(prev => prev + addedGlobalTime);
      if (newCompleted > 0) {
        setCompletedTasks(c => c + newCompleted);
        setScore(s => s + newScore);
      }
    }, 100); 

    return () => clearInterval(gameLoop);
  }, [isPlaying, isGameOver, activeModal, lifeLostModal]);

  useEffect(() => {
    if (!isPlaying || isGameOver || activeModal || lifeLostModal !== null) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          setWinStatus(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, activeModal, lifeLostModal]);

  // --- ACCIONES ---

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
  };

  const assignTaskToEmployee = (taskId: string, empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    if (emp.isMedical) return; 
    if (emp.tasksDone >= 15 && emp.id !== "leader") return;
    if (emp.isAskingHelp || emp.currentTask || emp.isBurnedOut) return;

    const taskToAssign = backlog.find(t => t.id === taskId);
    if (!taskToAssign) return;

    if (emp.id !== "leader" && taskToAssign.type !== emp.bestTask) {
      setWrongAssignments(prev => prev + 1);
    }
    if (emp.isAi && taskToAssign.type === "lider") {
      setWrongAiAssignments(prev => prev + 1);
    }
    if (emp.id === "leader" && taskToAssign.type === "rutinaria") {
      setLeaderRutinarias(prev => prev + 1);
    }

    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, currentTask: taskToAssign, tasksAssigned: e.tasksAssigned + 1 } : e));
    setBacklog(prev => prev.filter(t => t.id !== taskId));
    setSelectedTaskId(null);
  };

  const getQuestionFromPool = (type: '1:1' | 'help') => {
    if (type === '1:1') {
      let pool = [...pool1on1];
      if (pool.length === 0) pool = shuffle([...ONE_ON_ONE_SCENARIOS]);
      const q = pool.pop();
      setPool1on1(pool);
      return q;
    } else {
      let pool = [...poolHelp];
      if (pool.length === 0) pool = shuffle([...SUPPORT_SCENARIOS]);
      const q = pool.pop();
      setPoolHelp(pool);
      return q;
    }
  };

  const handleEmployeeClick = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp || emp.isMedical) return;

    if (emp.isAskingHelp && emp.id !== "leader") {
      const q = getQuestionFromPool('help');
      setActiveModal({ empId, questions: [q], type: 'help' });
      return;
    }

    if (emp.isBurnedOut && emp.id !== "leader") {
      const q = getQuestionFromPool('1:1');
      setActiveModal({ empId, questions: [q], type: '1:1' });
      return;
    }

    if (selectedTaskId) {
      assignTaskToEmployee(selectedTaskId, empId);
    } else if (emp.currentTask) {
      setBacklog(prev => [...prev, emp.currentTask!]);
      setEmployees(prev => prev.map(e => e.id === empId ? { ...e, currentTask: null } : e));
    }
  };

  const handleDragStart = (e: any, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    setSelectedTaskId(taskId);
  };

  const handleDrop = (e: React.DragEvent, empId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) assignTaskToEmployee(taskId, empId);
  };

  const handleIceboxDrop = (e: React.DragEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    let taskId = e?.dataTransfer ? e.dataTransfer.getData("taskId") : null;
    if (!taskId && selectedTaskId) taskId = selectedTaskId; 
    
    const task = backlog.find(t => t.id === taskId);
    if (task) {
      setIcebox(prev => [...prev, task]);
      setBacklog(prev => prev.filter(t => t.id !== taskId));
      setSelectedTaskId(null);
    }
  };

  const handleModalAnswer = (result: string) => {
    if (!activeModal) return;
    
    if (result !== 'good') setBadAnswers(prev => prev + 1);

    if (activeModal.type === '1:1') {
      if (result === 'good') {
        setEmployees(prev => prev.map(e => e.id === activeModal.empId ? { ...e, stress: 0, isBurnedOut: false } : e));
        setScore(s => s + 50);
      } else {
        setEmployees(prev => prev.map(e => e.id === activeModal.empId ? { ...e, stress: Math.min(100, e.stress + 60), isBurnedOut: false } : e));
      }
      setActiveModal(null);
    } else if (activeModal.type === 'help') {
      if (result === 'good') {
        setEmployees(prev => prev.map(e => e.id === activeModal.empId ? { ...e, isAskingHelp: false } : e));
        setScore(s => s + 20);
      } else {
        setEmployees(prev => prev.map(e => e.id === activeModal.empId ? { ...e, isAskingHelp: false, stress: Math.min(100, e.stress + 40) } : e));
      }
      setActiveModal(null);
    }
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'urgente': return <ShieldAlert size={14} className="text-red-400" />;
      case 'compleja': return <BrainCircuit size={14} className="text-purple-400" />;
      case 'rutinaria': return <FileText size={14} className="text-blue-400" />;
      case 'lider': return <Star size={14} className="text-amber-400" />;
    }
  };

  const startGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (leaderName.trim()) {
      setEmployees([
        { id: "leader", name: leaderName, role: "Gerente de Proyectos (tú)", avatar: "👑", stress: 0, maxStress: 0, tasksAssigned: 0, currentTask: null, isBurnedOut: false, tasksDone: 0, isAskingHelp: false, isMedical: false, medicalTimer: 0, timeSpentWorkingMs: 0, bestTask: 'all' },
        ...INITIAL_EMPLOYEES
      ]);
      const pool = shuffle(MASTER_TASK_POOL);
      setTaskPool(pool);
      setPool1on1(shuffle([...ONE_ON_ONE_SCENARIOS]));
      setPoolHelp(shuffle([...SUPPORT_SCENARIOS]));
      setHasStarted(true);
      setTutorialStep(1);
      ticksRef.current = 0;
      
      const firstTask = pool.pop();
      setBacklog([{ ...firstTask, id: "start1", workDone: 0, createdAt: Date.now() }]);
    }
  };

  const restartGame = () => {
    setEmployees([
      { id: "leader", name: leaderName, role: "Gerente de Proyectos (tú)", avatar: "👑", stress: 0, maxStress: 0, tasksAssigned: 0, currentTask: null, isBurnedOut: false, tasksDone: 0, isAskingHelp: false, isMedical: false, medicalTimer: 0, timeSpentWorkingMs: 0, bestTask: 'all' },
      ...INITIAL_EMPLOYEES
    ]);
    const pool = shuffle(MASTER_TASK_POOL);
    setTaskPool(pool);
    setPool1on1(shuffle([...ONE_ON_ONE_SCENARIOS]));
    setPoolHelp(shuffle([...SUPPORT_SCENARIOS]));
    
    const firstTask = pool.pop();
    setBacklog([{ ...firstTask, id: "start1", workDone: 0, createdAt: Date.now() }]);
    setIcebox([]);
    setCompletedTasks(0);
    setGeneratedTasks(1);
    setWrongAssignments(0);
    setBadAnswers(0);
    setLeaderRutinarias(0);
    setWrongAiAssignments(0);
    setScore(0);
    setTimeLeft(120);
    setLives(3);
    setLivesLostCount(0);
    setTotalTaskTimeMs(0);
    setIsGameOver(false);
    setIsPlaying(true);
    setSelectedTaskId(null);
    setActiveModal(null);
    setLifeLostModal(null);
    ticksRef.current = 0;
  };

  const getFeedback = () => {
    const wrongDelayed = icebox.filter(t => !t.canBeDelayed).length;
    const rightDelayed = icebox.filter(t => t.canBeDelayed).length;
    const burnedOutEmployees = employees.filter(e => e.maxStress >= 100 && e.id !== "leader").length;
    
    let feedback = "";
    
    // 1. Priorización (Icebox)
    if (wrongDelayed > 0) {
      feedback += `🚩 Peligro: Enviaste ${wrongDelayed} tareas CRÍTICAS a "Para Después". ¡El lanzamiento y la auditoría sufrieron por esto! \n\n`;
    } else if (rightDelayed > 0) {
      feedback += `✅ Excelente: Pospusiste ${rightDelayed} tareas de baja prioridad correctamente, manteniendo el foco. \n\n`;
    } else {
      feedback += `⚖️ Priorización: No archivaste suficientes tareas triviales. ¡Aprende a decir "no" a lo irrelevante para ganar tiempo!\n\n`;
    }

    // 2. Delegación y AI
    if (wrongAiAssignments > 0) {
      feedback += `🤖 Límite Humano-AI: Le delegaste a la Inteligencia Artificial tareas que requieren liderazgo, empatía humana o estrategia profunda (${wrongAiAssignments} veces). ¡No automatices el toque humano!\n\n`;
    }
    if (wrongAssignments > 2) {
      feedback += `⚠️ Asignación: Le diste tareas al perfil equivocado ${wrongAssignments} veces. Conoce mejor a tu equipo. \n\n`;
    } else {
      feedback += `🏆 Maestro delegando: Asignaste cada tarea exactamente a la persona o AI correcta casi sin fallar. \n\n`;
    }
    
    // 3. Salud Mental
    if (burnedOutEmployees > 0) {
      feedback += `🔥 Alerta Humana: ${burnedOutEmployees} persona(s) llegaron a BURNOUT por estrés extremo. Como líder debes revisar esto; tu equipo es lo más importante. \n\n`;
    } else {
      feedback += `🧘 Liderazgo Sano: Nadie llegó a Burnout. Cuidaste la salud mental de tu equipo bajo presión.\n\n`;
    }

    // 4. Comunicación
    if (badAnswers > 0) {
      feedback += `🗣️ Comunicación: Orientaste mal al equipo ${badAnswers} veces en dudas o 1:1, elevando su estrés. ¡Mejora tu empatía y asertividad! \n\n`;
    } else {
      feedback += `✅ Comunicación Asertiva: Fuiste una guía excelente en todos los 1:1 y dudas técnicas. Dabas claridad en medio del caos. \n\n`;
    }

    // 5. Micromanagement
    if (leaderRutinarias > 0) {
      feedback += `⚠️ Micromanagement: Tomaste ${leaderRutinarias} tarea(s) operativas (rutinarias). Como líder debes enfocarte en lo táctico y estratégico, delegar es clave.\n\n`;
    } else {
      feedback += `🎯 Líder Estratégico: Te mantuviste alejado del trabajo operativo y te enfocaste en la visión general de los 2 objetivos grandes.\n\n`;
    }

    return feedback;
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-[#090D16] text-slate-200 flex flex-col items-center justify-center p-6 font-sans overflow-y-auto">
        
        {/* BANNER FIJO SUPERIOR */}
        <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#111f38] to-[#1a365d] p-5 flex justify-center z-50 shadow-lg border-b border-[#2a4365]">
           <h1 className="text-3xl font-black text-white tracking-tight">
             Club de Liderazgo<span className="text-[#68D391]">.AI</span>
           </h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full text-center space-y-6 mt-24 mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2 flex items-center justify-center gap-3">
            Un Día <Flame className="w-12 h-12 text-red-500 fill-yellow-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          </h1>
          <p className="text-lg text-amber-400 font-bold max-w-2xl mx-auto leading-relaxed mt-4 bg-amber-900/20 p-4 rounded-xl border border-amber-500/30">
            Serás exitoso si: Gestionas TODO el Backlog correctamente en el tiempo asignado sin llevar a tu equipo al burnout.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8 mt-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2"><Target /> Tus Grandes Metas</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• 🎤 <strong>Ejecutar el Evento Empresarial para 800 personas:</strong> ¡Debe ser un éxito total!</li>
                <li>• 📋 <strong>Gestionar Proveedores y Logística:</strong> Sin fallas, sin retrasos, sin excusas.</li>
                <li>• ⚠️ <strong>¡Cuidado!</strong> La presión es enorme y tu equipo colapsará si no delegas bien.</li>
              </ul>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2"><FileText /> Instrucciones de Juego</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• <strong>Asignar Tareas:</strong> Clickea la tarea en la bandeja y luego clickea al empleado para asignarla.</li>
                <li>• <strong>Caja "Para Después":</strong> Envía ahí todo el trabajo basura que <strong>no aporta</strong> a tus dos grandes metas.</li>
                <li>• <strong>Vigila el Estrés:</strong> Si asignas tareas al perfil incorrecto, el estrés subirá el doble y perderás productividad.</li>
              </ul>
            </div>
          </div>

          <form onSubmit={startGame} className="max-w-md mx-auto space-y-6 bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
            <div className="text-left">
              <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Tu Nombre</label>
              <input 
                type="text" 
                required
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder="Ej. María Pérez" 
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            
            <label className="flex items-center justify-center gap-3 cursor-pointer group">
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${rulesAccepted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 group-hover:border-slate-400'}`}>
                {rulesAccepted && <CheckCircle size={16} className="text-slate-900" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={rulesAccepted}
                onChange={(e) => setRulesAccepted(e.target.checked)}
              />
              <span className="text-slate-300 font-medium select-none text-sm">Están claras las reglas y objetivos. Acepto el reto.</span>
            </label>

            <button 
              type="submit" 
              disabled={!rulesAccepted || !leaderName.trim()}
              className={`w-full py-4 rounded-xl font-black text-lg transition-all flex justify-center items-center gap-2 ${
                rulesAccepted && leaderName.trim() 
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play fill="currentColor" size={20} /> INICIAR JORNADA (2 MIN)
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen bg-[#090D16] text-slate-200 flex flex-col font-sans overflow-hidden">
      
      <header className="px-4 py-2 bg-[#0F172A] border-b border-slate-800 flex justify-between items-center shrink-0 relative z-[105]">
        <div className={`flex items-center gap-4 transition-all ${tutorialStep === 1 ? 'relative z-[101] ring-4 ring-red-500 bg-slate-900 p-2 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)]' : ''}`}>
          <div className="flex gap-1 text-red-500">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={18} fill={i < lives ? "currentColor" : "none"} className={i >= lives ? "text-slate-700" : ""} />
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className={`text-xl font-black font-mono ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-slate-200'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="text-right bg-slate-800 px-3 py-1 rounded-lg min-w-[80px]">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Pts</p>
            <p className="text-sm font-black text-amber-400">{score}</p>
          </div>
        </div>
      </header>

      <div className="bg-indigo-950/40 border-b border-indigo-900/50 px-4 py-1.5 flex justify-center items-center gap-4 shrink-0 overflow-x-auto whitespace-nowrap">
        <span className="text-[11px] font-black tracking-widest text-indigo-400 uppercase flex items-center gap-1 shrink-0">
          <Target size={12}/> OBJETIVOS DE HOY:
        </span>
        <div className="flex gap-4 text-[12px] font-bold text-slate-300">
           <span>1. Evento Empresarial 800 Personas</span>
           <span className="text-slate-600">|</span>
           <span>2. Gestión de Proveedores y Logística</span>
        </div>
      </div>

      <main className="flex-1 p-2 md:p-4 flex flex-col md:flex-row gap-2 md:gap-4 overflow-hidden">
        
        {/* ZONA DE EMPLEADOS (Arriba en móvil 60%, izquierda en PC) */}
        <div className="h-[65%] md:h-auto md:flex-1 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-800 pb-2 md:pb-0 md:pr-4">
          <div className="flex justify-between items-center mb-2 shrink-0">
             <h2 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
               <UserPlus size={14} /> Equipo
             </h2>
             <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">{completedTasks} Completadas</span>
          </div>
          
          <div className={`flex-1 overflow-y-auto pr-1 custom-scrollbar ${(tutorialStep === 2 || tutorialStep === 3) ? 'relative z-[101] ring-4 ring-emerald-500 p-2 bg-[#090D16] rounded-xl' : ''}`}>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {employees.map(emp => (
                <motion.div 
                  key={emp.id}
                  onClick={() => handleEmployeeClick(emp.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, emp.id)}
                  className={`relative p-1.5 md:p-2 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer ${
                    emp.id === "leader" ? 'bg-indigo-900/40 border-indigo-500/50 hover:bg-indigo-900/60' :
                    emp.isMedical ? 'bg-slate-800 border-slate-700 opacity-60' :
                    emp.tasksDone >= 15 ? 'bg-slate-900 border-slate-800 opacity-50 grayscale' :
                    emp.isBurnedOut ? 'bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' : 
                    emp.isAskingHelp ? 'bg-amber-950/40 border-amber-500 animate-pulse' :
                    selectedTaskId && !emp.currentTask ? 'bg-slate-800 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] scale-[1.02]' :
                    'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700'
                  }`}
                >
                  <div className="absolute -top-2 -right-2">
                     {emp.id === "leader" && <span className="bg-amber-500 text-[9px] px-1 py-0.5 rounded text-slate-900 font-bold">LÍDER</span>}
                     {emp.isMedical && <span className="bg-slate-600 text-[9px] px-1 py-0.5 rounded text-white font-bold flex items-center gap-1"><Stethoscope size={8}/>CITA</span>}
                     {emp.tasksDone >= 15 && emp.id !== "leader" && !emp.isMedical && <span className="bg-slate-700 text-[9px] px-1 py-0.5 rounded text-white font-bold">FIN</span>}
                     {emp.isBurnedOut && !emp.isMedical && <span className="bg-red-500 text-[9px] px-1 py-0.5 rounded text-white font-bold flex items-center gap-1"><Flame size={8}/> 1:1 URGENTE</span>}
                     {emp.isAskingHelp && !emp.isMedical && !emp.isBurnedOut && <span className="bg-amber-500 text-[9px] px-1 py-0.5 rounded text-slate-900 font-bold flex items-center gap-1"><HelpCircle size={8}/> PREGUNTA</span>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="text-xl md:text-2xl">{emp.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className={`font-bold text-[12px] md:text-sm truncate ${emp.id === "leader" ? "text-amber-400" : emp.isMedical ? "text-slate-400 line-through" : "text-white"}`}>{emp.name}</h3>
                        {emp.id !== "leader" && !emp.isMedical && <span title="Afín a esta tarea" className="opacity-50">{getTaskIcon(emp.bestTask as TaskType)}</span>}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{emp.role}</p>
                    </div>
                  </div>

                  {!emp.isBurnedOut && !emp.isMedical && (emp.tasksDone < 15 || emp.id === "leader") && (
                    <div className="w-full">
                      <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className={`h-full ${emp.stress > 80 ? 'bg-red-500' : emp.stress > 50 ? 'bg-orange-400' : 'bg-emerald-500'}`} style={{ width: `${emp.stress}%` }} />
                      </div>
                      <div className="flex justify-between mt-0.5">
                         <span className="text-[8px] text-slate-500">{Math.floor(emp.stress)}% Estrés</span>
                         {emp.id !== "leader" ? (
                            <span className="text-[8px] text-emerald-500 font-bold">{emp.tasksDone}/15</span>
                         ) : (
                            <span className="text-[8px] text-indigo-400 font-bold">∞</span>
                         )}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-1">
                    {emp.isMedical ? (
                      <div className="bg-slate-900/80 rounded py-0.5 text-center text-[9px] text-slate-500 font-bold">EN EL DOCTOR</div>
                    ) : emp.tasksDone >= 15 && emp.id !== "leader" ? (
                      <div className="bg-slate-900/80 rounded py-0.5 text-center text-[9px] text-slate-500 font-bold">FUERA DE OFICINA</div>
                    ) : emp.isBurnedOut ? (
                       <div className="bg-red-500/20 text-red-400 border border-red-500/50 rounded py-0.5 text-center text-[9px] font-bold flex items-center justify-center gap-1">
                         <MessageCircle size={8} /> HABLAR
                       </div>
                    ) : emp.isAskingHelp && emp.id !== "leader" ? (
                       <div className="bg-amber-500 text-amber-950 rounded py-0.5 text-center text-[9px] font-bold">GUIAR</div>
                    ) : emp.currentTask ? (
                      <div className="bg-slate-900/50 rounded p-1 border border-slate-700/50">
                        <div className="flex items-center gap-1 mb-1 text-[9px] font-semibold truncate">
                          {getTaskIcon(emp.currentTask.type)}
                          <span className="truncate">{emp.currentTask.name}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400" style={{ width: `${(emp.currentTask.workDone / emp.currentTask.workRequired) * 100}%` }} />
                        </div>
                      </div>
                    ) : (
                      <div className="h-[20px] border border-dashed border-slate-600 rounded flex items-center justify-center text-[9px] text-slate-500">
                        {selectedTaskId ? "Asignar" : "Libre"}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div 
            onClick={() => {
              if (selectedTaskId) {
                 const task = backlog.find(t => t.id === selectedTaskId);
                 if (task) {
                   setIcebox(prev => [...prev, task]);
                   setBacklog(prev => prev.filter(t => t.id !== selectedTaskId));
                   setSelectedTaskId(null);
                 }
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleIceboxDrop}
            className={`mt-2 h-16 md:h-20 shrink-0 border-2 border-dashed rounded-xl flex flex-col overflow-hidden transition-colors cursor-pointer ${
              selectedTaskId ? 'border-blue-500 bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-600/50 bg-slate-900/50 hover:border-blue-500/50'
            } ${tutorialStep === 5 ? 'relative z-[101] ring-4 ring-orange-400 bg-slate-900' : ''}`}
          >
            <h2 className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between p-1 md:p-1.5 bg-slate-800/80">
              <span className="flex items-center gap-1"><Archive size={12} /> Para Después</span>
              <span className="bg-slate-700 px-1.5 py-0.5 rounded text-white">{icebox.length}</span>
            </h2>
            <div className="flex-1 flex items-center justify-center p-1 text-center relative">
              {icebox.length === 0 ? (
                <p className="text-[9px] text-slate-600 font-medium px-2 leading-tight">
                  {selectedTaskId ? "¡Clickea aquí para archivar!" : "Arrastra aquí tareas inútiles."}
                </p>
              ) : (
                <div className="absolute inset-0 p-1 overflow-y-auto custom-scrollbar flex flex-wrap gap-1 content-start">
                  {icebox.map(task => (
                    <div key={task.id} className="bg-slate-800 rounded p-1" title={task.name}>
                      {getTaskIcon(task.type)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ZONA DE TAREAS (Abajo en móvil 40%, derecha en PC) */}
        <div className={`flex-1 md:h-auto md:w-64 lg:w-72 flex flex-col shrink-0 min-h-0 gap-2 bg-slate-900/90 border border-indigo-500/30 rounded-xl p-2 ${tutorialStep === 4 ? 'relative z-[101] ring-4 ring-blue-400 bg-slate-800' : ''}`}>
          
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <h2 className="text-xs font-bold text-indigo-400 uppercase flex items-center justify-between mb-2 shrink-0">
              <span className="flex items-center gap-1"><FileText size={14} /> Bandeja <span className="text-[9px] font-normal normal-case ml-1 text-slate-400">(Clickea para asignar)</span></span>
              <span className={`${backlog.length >= 10 ? 'text-red-400 animate-pulse font-bold' : 'text-slate-500'}`}>{backlog.length}/13</span>
            </h2>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 custom-scrollbar">
              <AnimatePresence>
                {backlog.map(task => (
                  <motion.div
                    key={task.id}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, task.id)}
                    layout
                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => handleTaskClick(task.id)}
                    className={`p-2 rounded-lg cursor-pointer md:cursor-grab active:cursor-grabbing border transition-all ${
                      task.type === 'lider' ? 'border-amber-500/50 bg-amber-950/20' : 
                      selectedTaskId === task.id ? 'bg-emerald-900 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] scale-[1.02]' : 
                      'bg-[#1E293B] border-indigo-700/30 hover:bg-slate-800 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getTaskIcon(task.type)}
                      <h4 className={`font-semibold text-xs truncate ${task.type === 'lider' ? 'text-amber-400' : 'text-slate-200'}`} title={task.name}>
                        {task.name}
                      </h4>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
        </div>
      </main>

      <AnimatePresence>
        {lifeLostModal !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-slate-800 border-2 border-red-500 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.3)]">
              <Heart className="w-20 h-20 text-red-500 mx-auto mb-4 animate-pulse" fill="currentColor" />
              <h2 className="text-2xl font-black text-white mb-2">¡Bandeja Desbordada!</h2>
              <p className="text-slate-300 mb-6 font-medium text-lg">
                Te {lifeLostModal === 1 ? 'queda' : 'quedan'} <span className="text-red-400 font-bold">{lifeLostModal}</span> {lifeLostModal === 1 ? 'vida' : 'vidas'}.
              </p>
              <button 
                onClick={() => setLifeLostModal(null)}
                className="w-full bg-red-500 hover:bg-red-400 text-white px-6 py-4 rounded-xl font-black text-lg transition-all active:scale-95"
              >
                CONTINUAR LIDERANDO
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className={`bg-slate-800 border p-6 rounded-2xl max-w-sm w-full shadow-2xl ${activeModal.type === 'help' ? 'border-amber-500/50' : 'border-blue-500/50'}`}>
              <div className="flex items-center gap-3 mb-4">
                {activeModal.type === 'help' ? <HelpCircle className="text-amber-400" size={24} /> : <MessageCircle className="text-blue-400" size={24} />}
                <h3 className="font-bold text-lg text-white">
                  {activeModal.type === 'help' ? 'Duda Técnica (Tiempo Congelado)' : 'Reunión 1:1 (Tiempo Congelado)'}
                </h3>
              </div>
              <p className="text-slate-300 mb-6 font-medium italic">
                "{activeModal.questions[0].q}"
              </p>
              <div className="space-y-2">
                {activeModal.questions[0].opts.map((opt: any, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => handleModalAnswer(opt.res)}
                    className="w-full text-left p-3 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 rounded-xl text-sm transition-colors text-slate-200"
                  >
                    {opt.t}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isGameOver && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto py-10">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0F172A] border border-slate-700 p-6 md:p-8 rounded-3xl max-w-2xl w-full text-center shadow-2xl">
            {winStatus ? (
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            ) : (
              <Zap className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            
            <h2 className="text-3xl font-black text-white mb-2">{winStatus ? '¡Sobreviviste al Día!' : 'Colapso Total'}</h2>
            
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4 text-left text-sm text-slate-300 whitespace-pre-line shadow-inner max-h-60 overflow-y-auto custom-scrollbar">
              <h4 className="font-bold text-white mb-2 uppercase text-[10px] tracking-wider text-center">Evaluación de Liderazgo Estratégico</h4>
              {getFeedback()}
            </div>
            
            {/* RANKING (Leaderboard) eliminado */}

            <div className="grid grid-cols-3 gap-2 text-left mb-6 bg-slate-900/30 p-4 rounded-xl">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1"><CheckCircle size={10} className="inline mr-1"/> Tareas</p>
                <p className="text-lg text-emerald-400 font-medium">{completedTasks} <span className="text-xs text-slate-500">/ {generatedTasks}</span></p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1"><Star size={10} className="inline mr-1"/> Puntos</p>
                <p className="text-lg text-amber-400 font-medium">{score}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1"><Archive size={10} className="inline mr-1"/> Diferidas</p>
                <p className="text-lg text-indigo-400 font-medium">{icebox.length}</p>
              </div>
            </div>

            <button onClick={restartGame} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-4 rounded-xl font-black text-lg transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              JUGAR DE NUEVO
            </button>
          </motion.div>
        </div>
      )}
      <AnimatePresence>
        {tutorialStep > 0 && tutorialStep <= 5 && (
          <motion.div 
            key="bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm"
          />
        )}
        {tutorialStep > 0 && tutorialStep <= 5 && (
          <motion.div 
            key="popup"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed inset-0 z-[110] flex justify-center p-4 pointer-events-none ${
              tutorialStep === 1 ? 'items-center mt-12' : 
              (tutorialStep === 2 || tutorialStep === 3) ? 'items-end pb-8' : 
              tutorialStep === 4 ? 'items-start pt-24' : 
              'items-start pt-12'
            } md:items-center`}
          >
             <div className="bg-[#0F172A] p-6 rounded-2xl border border-indigo-500 shadow-2xl max-w-sm text-center pointer-events-auto">
                {tutorialStep === 1 && (
                  <>
                     <h3 className="text-2xl font-black text-red-500 mb-3 flex items-center justify-center gap-2"><Heart size={28}/> Vidas</h3>
                     <p className="text-slate-300 font-medium leading-relaxed">Aquí encontrarás tus vidas. Si la <strong>Bandeja de Tareas</strong> se llena (13 tareas), colapsarás y perderás una vida.</p>
                  </>
                )}
                {tutorialStep === 2 && (
                  <>
                     <h3 className="text-2xl font-black text-emerald-400 mb-3 flex items-center justify-center gap-2"><UserPlus size={28}/> Tu Equipo</h3>
                     <p className="text-slate-300 font-medium leading-relaxed">Cada persona tiene una <strong>especialidad</strong> y un límite de estrés. ¡Dales la tarea correcta o se quemarán el doble de rápido!</p>
                  </>
                )}
                {tutorialStep === 3 && (
                  <>
                     <h3 className="text-3xl font-black text-amber-400 mb-3 flex items-center justify-center gap-2"><UserPlus size={30}/> Perfiles de tu Equipo</h3>
                     <div className="text-slate-300 font-medium text-sm text-left space-y-2.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
                       <p className="font-bold text-slate-200 mb-2 text-[13px] uppercase tracking-wider">Recuerda que tu equipo tiene:</p>
                       <p>• <strong>👑 Tú:</strong> Gerente de Proyectos (Decisiones estratégicas y de liderazgo)</p>
                       <p>• <strong>Sofía:</strong> Experiencia — Logística, agenda y proveedores críticos</p>
                       <p>• <strong>Mateo:</strong> Apaga-incendios — Emergencias y crisis del evento</p>
                       <p>• <strong>Valeria:</strong> Junior — Correos, listas, documentos y agenda</p>
                       <p>• <strong>Copilot y Gemini:</strong> Análisis de datos, reportes y tareas repetitivas</p>
                     </div>
                  </>
                )}
                {tutorialStep === 4 && (
                  <>
                     <h3 className="text-2xl font-black text-blue-400 mb-3 flex items-center justify-center gap-2"><FileText size={28}/> La Bandeja</h3>
                     <p className="text-slate-300 font-medium leading-relaxed">Aquí es donde llegan los problemas sin parar. Haz clic en la tarea y luego haz clic en el empleado que pueda resolverla.</p>
                  </>
                )}
                {tutorialStep === 5 && (
                  <>
                     <h3 className="text-2xl font-black text-orange-400 mb-3 flex items-center justify-center gap-2"><Archive size={28}/> Para Después</h3>
                     <p className="text-slate-300 font-medium leading-relaxed">Si una tarea NO aporta al evento ni a la gestión de proveedores, ¡envíala aquí inmediatamente!</p>
                  </>
                )}
                <button 
                  onClick={() => {
                    if (tutorialStep === 5) {
                      setTutorialStep(6);
                      setIsPlaying(true);
                    } else {
                      setTutorialStep(s => s + 1);
                    }
                  }}
                  className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition-all active:scale-95 text-lg"
                >
                  {tutorialStep === 5 ? "¡ARRANCAR!" : "Entendido"}
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
