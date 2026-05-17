"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShieldAlert, BrainCircuit, FileText, UserPlus, Flame, CheckCircle, Play, MessageCircle, AlertTriangle, Zap, Clock, Star, HelpCircle, Stethoscope, Archive, Target, BarChart2, Trophy } from "lucide-react";

// --- TIPOS DE DATOS ---
type TaskType = 'urgente' | 'compleja' | 'rutinaria' | 'lider';

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
  { id: "e4", name: "Valeria", role: "Novata", avatar: "👧", stress: 0, maxStress: 0, tasksAssigned: 0, currentTask: null, isBurnedOut: false, tasksDone: 0, isAskingHelp: false, isMedical: false, medicalTimer: 0, timeSpentWorkingMs: 0, bestTask: 'rutinaria' },
  { id: "e5", name: "Ana", role: "Asistente", avatar: "👩‍🔧", stress: 0, maxStress: 0, tasksAssigned: 0, currentTask: null, isBurnedOut: false, tasksDone: 0, isAskingHelp: false, isMedical: false, medicalTimer: 0, timeSpentWorkingMs: 0, bestTask: 'rutinaria' },
  { id: "e6", name: "Elena", role: "Especialista", avatar: "👩‍💻", stress: 0, maxStress: 0, tasksAssigned: 0, currentTask: null, isBurnedOut: false, tasksDone: 0, isAskingHelp: false, isMedical: false, medicalTimer: 0, timeSpentWorkingMs: 0, bestTask: 'compleja' }
];

const MASTER_TASK_POOL = [
  // LÍDER (10)
  { name: "Aprobar presupuesto App V2", type: "lider", workRequired: 120, canBeDelayed: false },
  { name: "Negociar con Firma Auditora", type: "lider", workRequired: 100, canBeDelayed: false },
  { name: "Reunión con CEO por Lanzamiento", type: "lider", workRequired: 150, canBeDelayed: false },
  { name: "Firmar balance final anual", type: "lider", workRequired: 140, canBeDelayed: false },
  { name: "Aprobar rediseño final App V2", type: "lider", workRequired: 90, canBeDelayed: false },
  { name: "Desvincular proveedor fraudulento", type: "lider", workRequired: 110, canBeDelayed: false },
  { name: "Presentar informe a la Junta", type: "lider", workRequired: 160, canBeDelayed: false },
  { name: "Resolver bloqueo legal de la App", type: "lider", workRequired: 130, canBeDelayed: false },
  { name: "Aprobar reestructuración contable", type: "lider", workRequired: 100, canBeDelayed: false },
  { name: "Declarar retraso de la App V2", type: "lider", workRequired: 150, canBeDelayed: false },

  // URGENTES (15)
  { name: "Caída de servidor App V2", type: "urgente", workRequired: 90, canBeDelayed: false },
  { name: "Enviar documentos contables YA", type: "urgente", workRequired: 80, canBeDelayed: false },
  { name: "Bug crítico en pasarela App V2", type: "urgente", workRequired: 120, canBeDelayed: false },
  { name: "Subsanar multa de Hacienda", type: "urgente", workRequired: 130, canBeDelayed: false },
  { name: "Pérdida de datos de prueba App", type: "urgente", workRequired: 60, canBeDelayed: false },
  { name: "Reembolso por error App V2", type: "urgente", workRequired: 100, canBeDelayed: false },
  { name: "Firma urgente de servidores", type: "urgente", workRequired: 70, canBeDelayed: false },
  { name: "Inspección sorpresa de auditores", type: "urgente", workRequired: 110, canBeDelayed: false },
  { name: "Descuadre contable grave", type: "urgente", workRequired: 90, canBeDelayed: false },
  { name: "Campaña App V2 bloqueada", type: "urgente", workRequired: 85, canBeDelayed: false },
  { name: "Fallo de seguridad en la App", type: "urgente", workRequired: 120, canBeDelayed: false },
  { name: "Responder hallazgo de auditoría", type: "urgente", workRequired: 90, canBeDelayed: false },
  { name: "Robo de laptop con código App", type: "urgente", workRequired: 60, canBeDelayed: false },
  { name: "Pagar impuestos atrasados", type: "urgente", workRequired: 80, canBeDelayed: false },
  { name: "Rumor de quiebra en prensa", type: "urgente", workRequired: 100, canBeDelayed: false },

  // COMPLEJAS (15)
  { name: "Armar plan de marketing App V2", type: "compleja", workRequired: 140, canBeDelayed: false },
  { name: "Revisar arquitectura App V2", type: "compleja", workRequired: 150, canBeDelayed: false },
  { name: "Auditoría de ciberseguridad", type: "compleja", workRequired: 130, canBeDelayed: false },
  { name: "Diseñar algoritmo principal App", type: "compleja", workRequired: 160, canBeDelayed: false },
  { name: "Migrar BD para la auditoría", type: "compleja", workRequired: 180, canBeDelayed: false },
  { name: "Revisión financiera interna", type: "compleja", workRequired: 120, canBeDelayed: false },
  { name: "Crear manual de usuario App V2", type: "compleja", workRequired: 110, canBeDelayed: false },
  { name: "Estructurar cuentas auditoría", type: "compleja", workRequired: 140, canBeDelayed: false },
  { name: "Optimizar embudo de la App", type: "compleja", workRequired: 120, canBeDelayed: false },
  { name: "Simulación de estrés financiero", type: "compleja", workRequired: 150, canBeDelayed: false },
  { name: "Rediseñar interfaz App V2", type: "compleja", workRequired: 130, canBeDelayed: false },
  { name: "Mapear procesos para auditores", type: "compleja", workRequired: 140, canBeDelayed: false },
  { name: "Integrar IA en la App V2", type: "compleja", workRequired: 160, canBeDelayed: false },
  { name: "Evaluar impacto fiscal anual", type: "compleja", workRequired: 180, canBeDelayed: false },
  { name: "Testeo de carga servidores App", type: "compleja", workRequired: 110, canBeDelayed: false },

  // RUTINARIAS - IMPORTANTES (5)
  { name: "Enviar facturas a auditores", type: "rutinaria", workRequired: 40, canBeDelayed: false },
  { name: "Agendar QA para App V2", type: "rutinaria", workRequired: 50, canBeDelayed: false },
  { name: "Conciliar cuentas de banco", type: "rutinaria", workRequired: 30, canBeDelayed: false },
  { name: "Contestar dudas de auditores", type: "rutinaria", workRequired: 20, canBeDelayed: false },
  { name: "Aprobar gastos de desarrollo", type: "rutinaria", workRequired: 60, canBeDelayed: false },

  // RUTINARIAS - PUEDEN RETRASARSE (Icebox) (15)
  { name: "Limpiar bandeja de spam", type: "rutinaria", workRequired: 30, canBeDelayed: true },
  { name: "Buscar memes para el chat", type: "rutinaria", workRequired: 20, canBeDelayed: true },
  { name: "Cambiar fondo de pantalla", type: "rutinaria", workRequired: 10, canBeDelayed: true },
  { name: "Actualizar foto de perfil", type: "rutinaria", workRequired: 15, canBeDelayed: true },
  { name: "Revisar boletín del sector", type: "rutinaria", workRequired: 25, canBeDelayed: true },
  { name: "Leer blog de tecnología", type: "rutinaria", workRequired: 30, canBeDelayed: true },
  { name: "Investigar nueva cafetera", type: "rutinaria", workRequired: 20, canBeDelayed: true },
  { name: "Encuesta de clima laboral", type: "rutinaria", workRequired: 40, canBeDelayed: true },
  { name: "Planear fiesta de fin de año", type: "rutinaria", workRequired: 50, canBeDelayed: true },
  { name: "Acomodar escritorio", type: "rutinaria", workRequired: 10, canBeDelayed: true },
  { name: "Comprar snacks de oficina", type: "rutinaria", workRequired: 20, canBeDelayed: true },
  { name: "Decorar para Halloween", type: "rutinaria", workRequired: 30, canBeDelayed: true },
  { name: "Actualizar firma de correo genérica", type: "rutinaria", workRequired: 15, canBeDelayed: true },
  { name: "Ver tutorial de Excel básico", type: "rutinaria", workRequired: 45, canBeDelayed: true },
  { name: "Organizar fotos antiguas", type: "rutinaria", workRequired: 40, canBeDelayed: true }
];

const ONE_ON_ONE_SCENARIOS = [
  { 
    q: "Siento que el cliente me falta el respeto y no aguanto más la presión.", 
    opts: [
      { t: "Nadie debe faltarte al respeto. Respira 10 min, yo hablaré con el cliente para fijar límites.", res: "good" }, 
      { t: "Pásame la tarea a mí, yo me encargo de todo para que no sufras.", res: "bad" }, 
      { t: "Es un cliente VIP, a veces toca aguantar. Trata de no tomarlo personal.", res: "bad" }
    ] 
  },
  { 
    q: "Tengo demasiado estrés por el lanzamiento y siento que voy a colapsar.", 
    opts: [
      { t: "Pausa todo. Vamos a priorizar juntos qué es vital hoy y qué puede esperar.", res: "good" }, 
      { t: "Todos estamos igual, es el lanzamiento. Toma café y sigamos, ya casi.", res: "bad" }, 
      { t: "Si no puedes con la presión, le asignaré estas tareas a otra persona.", res: "bad" }
    ] 
  },
  { 
    q: "Los auditores me están pidiendo cosas que no entiendo, estoy frustrado.", 
    opts: [
      { t: "Revisemos juntos qué piden y te guío para que aprendas a responderles.", res: "good" }, 
      { t: "Diles que hablen conmigo directamente, yo resuelvo todo con ellos.", res: "bad" }, 
      { t: "Busca en el manual de procedimientos o en Google, es tu responsabilidad.", res: "bad" }
    ] 
  },
  { 
    q: "Siento que me asignan tareas que no van con mi perfil y me frustra.", 
    opts: [
      { t: "Tienes razón. Hoy es contingencia, pero mañana alinearemos mejor tus tareas.", res: "good" }, 
      { t: "Es lo que la empresa necesita hoy. Tienes que ser más flexible.", res: "bad" }, 
      { t: "Si no te gusta, deja la tarea y que la tome otro que sí quiera trabajar.", res: "bad" }
    ] 
  },
  { 
    q: "He estado cometiendo muchos errores hoy por el estrés.", 
    opts: [
      { t: "Los errores pasan. Toma 5 min de pausa, luego hacemos un doble chequeo juntos.", res: "good" }, 
      { t: "Dame esas tareas a mí. Yo las terminaré para asegurar que queden bien.", res: "bad" }, 
      { t: "Concéntrate más, un error en esta auditoría nos puede costar carísimo.", res: "bad" }
    ] 
  }
];

const SUPPORT_SCENARIOS = [
  { 
    q: "Jefe, no entiendo cómo llenar este campo del reporte, ¿me explicas?", 
    opts: [
      { t: "Revisemos el formato juntos un par de minutos para que sepas hacerlo a futuro.", res: "good" }, 
      { t: "Pon cualquier valor estimado por ahora, lo importante es entregarlo rápido.", res: "bad" }, 
      { t: "Lee el manual de contabilidad. No tengo tiempo para cosas operativas.", res: "bad" }
    ] 
  },
  { 
    q: "La plataforma de la App arrojó un error 500 y no sé qué hacer.", 
    opts: [
      { t: "Documenta el error con pantallazos, escala a IT y avísame el tiempo estimado.", res: "good" }, 
      { t: "Sigue intentando recargar la página hasta que funcione, a veces colapsa.", res: "bad" }, 
      { t: "Cancela la tarea, si el sistema no sirve no es nuestra culpa, que esperen.", res: "bad" }
    ] 
  },
  { 
    q: "El proveedor dice que no puede entregarnos hoy. ¿Qué le digo?", 
    opts: [
      { t: "Pídele que justifique el retraso por correo y evalúa con él opciones alternativas.", res: "good" }, 
      { t: "Dile que es inaceptable, exígele que cumpla el contrato o lo demandaremos.", res: "bad" }, 
      { t: "Dile que no hay problema, reprograma todo para mañana y listo.", res: "bad" }
    ] 
  },
  { 
    q: "Tengo un problema con el VPN, no me conecta a la red interna.", 
    opts: [
      { t: "Abre un ticket con soporte de inmediato y avanza con tareas locales mientras.", res: "good" }, 
      { t: "Reinicia tu computadora y el router, eso siempre funciona en estos casos.", res: "bad" }, 
      { t: "Usa tu red personal sin la VPN para sacar lo urgente, no podemos atrasarnos.", res: "bad" }
    ] 
  },
  { 
    q: "El cliente me pide una funcionalidad que no está en el contrato.", 
    opts: [
      { t: "Explícale amablemente que está fuera del alcance y ofrece agendar para cotizarla.", res: "good" }, 
      { t: "Dile que sí, pero que tardará. Hay que mantener al cliente feliz a toda costa.", res: "bad" }, 
      { t: "Dile rotundamente que no y que lea el contrato que firmó.", res: "bad" }
    ] 
  },
  { 
    q: "Encontré una inconsistencia millonaria en los libros, ¿qué hago?", 
    opts: [
      { t: "Aísla esos registros. Haz un informe rápido y lo revisamos juntos antes de escalar.", res: "good" }, 
      { t: "Pásamela directo a mí en este instante, yo me encargo de los auditores.", res: "bad" }, 
      { t: "Intenta cuadrarlo con gastos varios para que la auditoría no levante hallazgo.", res: "bad" }
    ] 
  }
];

export default function GameUI() {
  const [leaderName, setLeaderName] = useState("");
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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
  const [wrongAssignments, setWrongAssignments] = useState(0); 
  const [badAnswers, setBadAnswers] = useState(0);
  const [leaderRutinarias, setLeaderRutinarias] = useState(0);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const [activeModal, setActiveModal] = useState<{empId: string, questions: any[], type: '1:1' | 'help'} | null>(null);
  const [lifeLostModal, setLifeLostModal] = useState<number | null>(null);

  // Pool de preguntas barajadas
  const [pool1on1, setPool1on1] = useState<any[]>([]);
  const [poolHelp, setPoolHelp] = useState<any[]>([]);
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const stateRef = useRef({ employees, backlog, icebox, lives, timeLeft, totalTaskTimeMs, taskPool, wrongAssignments });
  useEffect(() => {
    stateRef.current = { employees, backlog, icebox, lives, timeLeft, totalTaskTimeMs, taskPool, wrongAssignments };
  }, [employees, backlog, icebox, lives, timeLeft, totalTaskTimeMs, taskPool, wrongAssignments]);

  const ticksRef = useRef(0);

  const shuffle = (array: any[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  useEffect(() => {
    // Cargar leaderboard al inicio
    const saved = localStorage.getItem('cdl_leaderboard');
    if (saved) {
      try { setLeaderboard(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveToLeaderboard = () => {
    const wrongDelayed = icebox.filter(t => !t.canBeDelayed).length;
    const burnedOutEmployees = employees.filter(e => e.maxStress >= 100 && e.id !== "leader").length;

    const entry: LeaderboardEntry = {
      name: leaderName,
      score: score,
      burnouts: burnedOutEmployees,
      livesLost: livesLostCount,
      wrongAssignments: wrongAssignments,
      wrongIcebox: wrongDelayed,
      date: Date.now()
    };
    
    const newList = [...leaderboard, entry].sort((a, b) => b.score - a.score).slice(0, 10);
    setLeaderboard(newList);
    localStorage.setItem('cdl_leaderboard', JSON.stringify(newList));
  };

  // Game Loop
  useEffect(() => {
    if (!isPlaying || isGameOver || activeModal || lifeLostModal !== null) return;

    const gameLoop = setInterval(() => {
      ticksRef.current += 1;
      const currentTicks = ticksRef.current;
      
      const { employees: currentEmps, backlog: currentBacklog, lives: currentLives, taskPool: currentPool } = stateRef.current;
      let newBacklog = [...currentBacklog];
      let newPool = [...currentPool];
      let newCompleted = 0;
      let newScore = 0;
      let newLives = currentLives;
      let addedGlobalTime = 0;

      // Evento Especial: Cita médica al minuto 1 (Tick 600, quedan 60s)
      if (currentTicks === 600) {
         const availableEmps = currentEmps.filter(e => e.id !== "leader" && !e.isMedical);
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
        }
      };

      if (currentTicks % 40 === 0) spawnTask();
      if (currentTicks % 150 === 0) {
        for (let i = 0; i < 3; i++) spawnTask();
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
          saveToLeaderboard();
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

          const newWorkDone = emp.currentTask.workDone + progressStep;
          const newStress = Math.min(100, emp.stress + stressStep);
          const newMaxStress = Math.max(emp.maxStress, newStress);

          if (Math.random() < 0.005 && emp.id !== "leader") {
            return { ...emp, isAskingHelp: true, stress: newStress, maxStress: newMaxStress };
          }

          if (Math.random() < 0.002 && emp.id !== "leader") {
            newBacklog.push(emp.currentTask);
            return { ...emp, isBurnedOut: true, currentTask: null, stress: 100, maxStress: 100 };
          }

          if (newStress >= 100) {
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
          saveToLeaderboard();
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
    e.preventDefault();
    let taskId = e.dataTransfer.getData("taskId");
    if (!taskId && selectedTaskId) taskId = selectedTaskId; // Para dar click y enviar al icebox si se hizo click primero
    
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
        { id: "leader", name: leaderName, role: "Tú (Líder)", avatar: "👑", stress: 0, maxStress: 0, tasksAssigned: 0, currentTask: null, isBurnedOut: false, tasksDone: 0, isAskingHelp: false, isMedical: false, medicalTimer: 0, timeSpentWorkingMs: 0, bestTask: 'all' },
        ...INITIAL_EMPLOYEES
      ]);
      const pool = shuffle(MASTER_TASK_POOL);
      setTaskPool(pool);
      setPool1on1(shuffle([...ONE_ON_ONE_SCENARIOS]));
      setPoolHelp(shuffle([...SUPPORT_SCENARIOS]));
      setHasStarted(true);
      setIsPlaying(true);
      ticksRef.current = 0;
      
      const firstTask = pool.pop();
      setBacklog([{ ...firstTask, id: "start1", workDone: 0, createdAt: Date.now() }]);
    }
  };

  const restartGame = () => {
    setEmployees([
      { id: "leader", name: leaderName, role: "Tú (Líder)", avatar: "👑", stress: 0, maxStress: 0, tasksAssigned: 0, currentTask: null, isBurnedOut: false, tasksDone: 0, isAskingHelp: false, isMedical: false, medicalTimer: 0, timeSpentWorkingMs: 0, bestTask: 'all' },
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
    setWrongAssignments(0);
    setBadAnswers(0);
    setLeaderRutinarias(0);
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
    
    if (wrongDelayed > 0) {
      feedback += `🚩 Peligro: Enviaste ${wrongDelayed} tareas CRÍTICAS a "Para Después". ¡El lanzamiento y la auditoría sufrieron por esto! \n\n`;
    }
    if (rightDelayed > 0) {
      feedback += `✅ Excelente: Pospusiste ${rightDelayed} tareas de baja prioridad correctamente, manteniendo el foco. \n\n`;
    }
    if (wrongAssignments > 3) {
      feedback += `⚠️ Asignación: Le diste tareas al perfil equivocado ${wrongAssignments} veces. Conoce mejor a tu equipo. \n\n`;
    } else if (wrongAssignments === 0 && completedTasks > 0) {
      feedback += `🏆 Maestro delegando: Asignaste cada tarea exactamente a la persona correcta sin fallar. \n\n`;
    }
    
    if (burnedOutEmployees > 0) {
      feedback += `🔥 Alerta Humana: ${burnedOutEmployees} persona(s) llegaron a BURNOUT por estrés extremo. Como líder debes revisar esto; tu equipo es lo más importante, mucho más que cualquier lanzamiento o auditoría. \n\n`;
    } else if (completedTasks > 0) {
      feedback += `🧘 Liderazgo Sano: Nadie llegó a Burnout. Cuidaste la salud mental de tu equipo bajo presión.\n\n`;
    }

    if (badAnswers > 0) {
      feedback += `🗣️ Comunicación: Orientaste mal al equipo ${badAnswers} veces en dudas o 1:1, elevando su estrés. ¡Mejora tu empatía y asertividad! \n\n`;
    }

    if (leaderRutinarias > 0) {
      feedback += `⚠️ Micromanagement: Tomaste ${leaderRutinarias} tarea(s) operativas (rutinarias). Como líder debes enfocarte en lo táctico y estratégico; delegar es clave para no volverte un cuello de botella.\n\n`;
    }

    if (feedback === "") {
      feedback = "Buen trabajo manteniendo el barco a flote. Sigue puliendo tu velocidad y priorización.";
    }
    return feedback;
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-[#090D16] text-slate-200 flex flex-col items-center justify-center p-6 font-sans overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full text-center space-y-6 my-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
            Simulador: Un Día Tuyo
          </h1>
          <p className="text-xl text-slate-400 font-medium">Tienes 2 MINUTOS para gestionar todo el trabajo sin llevar a tu equipo al Burnout.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8 mt-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2"><Target /> Objetivos de Hoy</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• <strong>1. Lanzamiento de App V2</strong></li>
                <li>• <strong>2. Cierre de Auditoría Financiera</strong></li>
                <li>• Los empleados te pedirán <strong>1:1 Urgente</strong> por la alta presión de estos objetivos.</li>
              </ul>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2"><Archive /> Priorización</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• <strong>Caja de "Para Después":</strong> Envía aquí las tareas que <strong>no aportan a los 2 objetivos</strong>.</li>
                <li>• <strong>Asignar (Móvil/PC):</strong> Clickea la tarea y luego clickea al empleado para asignarla (o arrástrala).</li>
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
      
      <header className="px-4 py-2 bg-[#0F172A] border-b border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
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
           <span>1. Lanzamiento App V2</span>
           <span className="text-slate-600">|</span>
           <span>2. Cierre Auditoría Financiera</span>
        </div>
      </div>

      <main className="flex-1 p-2 md:p-4 flex flex-col md:flex-row gap-2 md:gap-4 overflow-hidden">
        
        {/* ZONA DE EMPLEADOS (Arriba en móvil 60%, izquierda en PC) */}
        <div className="h-[60%] md:h-auto md:flex-1 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-800 pb-2 md:pb-0 md:pr-4">
          <div className="flex justify-between items-center mb-2 shrink-0">
             <h2 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
               <UserPlus size={14} /> Equipo
             </h2>
             <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">{completedTasks} Completadas</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {employees.map(emp => (
                <motion.div 
                  key={emp.id}
                  onClick={() => handleEmployeeClick(emp.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, emp.id)}
                  className={`relative p-2 md:p-3 rounded-xl border flex flex-col gap-2 transition-all cursor-pointer ${
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
                     {emp.id === "leader" && <span className="bg-amber-500 text-[10px] px-1.5 py-0.5 rounded text-slate-900 font-bold">LÍDER</span>}
                     {emp.isMedical && <span className="bg-slate-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold flex items-center gap-1"><Stethoscope size={10}/>CITA (10s)</span>}
                     {emp.tasksDone >= 15 && emp.id !== "leader" && !emp.isMedical && <span className="bg-slate-700 text-[10px] px-1.5 py-0.5 rounded text-white font-bold">Turno Fin</span>}
                     {emp.isBurnedOut && !emp.isMedical && <span className="bg-red-500 text-[10px] px-1.5 py-0.5 rounded text-white font-bold flex items-center gap-1"><Flame size={10}/> ¡1:1 URGENTE!</span>}
                     {emp.isAskingHelp && !emp.isMedical && !emp.isBurnedOut && <span className="bg-amber-500 text-[10px] px-1.5 py-0.5 rounded text-slate-900 font-bold flex items-center gap-1"><HelpCircle size={10}/> ¡PREGUNTA!</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-2xl md:text-3xl">{emp.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className={`font-bold text-xs md:text-sm truncate ${emp.id === "leader" ? "text-amber-400" : emp.isMedical ? "text-slate-400 line-through" : "text-white"}`}>{emp.name}</h3>
                        {emp.id !== "leader" && !emp.isMedical && <span title="Afín a esta tarea" className="opacity-50">{getTaskIcon(emp.bestTask as TaskType)}</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{emp.role}</p>
                    </div>
                  </div>

                  {!emp.isBurnedOut && !emp.isMedical && (emp.tasksDone < 15 || emp.id === "leader") && (
                    <div className="w-full">
                      <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className={`h-full ${emp.stress > 80 ? 'bg-red-500' : emp.stress > 50 ? 'bg-orange-400' : 'bg-emerald-500'}`} style={{ width: `${emp.stress}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                         <span className="text-[9px] text-slate-500">{Math.floor(emp.stress)}% Estrés</span>
                         {emp.id !== "leader" ? (
                            <span className="text-[9px] text-emerald-500 font-bold">{emp.tasksDone}/15 Dones</span>
                         ) : (
                            <span className="text-[9px] text-indigo-400 font-bold">∞</span>
                         )}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-1">
                    {emp.isMedical ? (
                      <div className="bg-slate-900/80 rounded py-1 text-center text-[10px] text-slate-500 font-bold">EN EL DOCTOR</div>
                    ) : emp.tasksDone >= 15 && emp.id !== "leader" ? (
                      <div className="bg-slate-900/80 rounded py-1 text-center text-[10px] text-slate-500 font-bold">FUERA DE OFICINA</div>
                    ) : emp.isBurnedOut ? (
                       <div className="bg-red-500/20 text-red-400 border border-red-500/50 rounded py-1 text-center text-[10px] font-bold flex items-center justify-center gap-1">
                         <MessageCircle size={10} /> CLIC PARA HABLAR
                       </div>
                    ) : emp.isAskingHelp && emp.id !== "leader" ? (
                       <div className="bg-amber-500 text-amber-950 rounded py-1 text-center text-[10px] font-bold">CLIC PARA GUIAR</div>
                    ) : emp.currentTask ? (
                      <div className="bg-slate-900/50 rounded p-1.5 border border-slate-700/50">
                        <div className="flex items-center gap-1 mb-1 text-[10px] font-semibold truncate">
                          {getTaskIcon(emp.currentTask.type)}
                          <span className="truncate">{emp.currentTask.name}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400" style={{ width: `${(emp.currentTask.workDone / emp.currentTask.workRequired) * 100}%` }} />
                        </div>
                      </div>
                    ) : (
                      <div className="h-[28px] border border-dashed border-slate-600 rounded flex items-center justify-center text-[10px] text-slate-500">
                        {selectedTaskId ? "Click para Asignar" : "Libre"}
                      </div>
                    )}
                    
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ZONA DE TAREAS (Abajo en móvil 40%, derecha en PC) */}
        <div className="flex-1 md:h-auto md:w-64 lg:w-72 flex flex-col shrink-0 min-h-0 gap-2">
          
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <h2 className="text-xs font-bold text-slate-400 uppercase flex items-center justify-between mb-2 shrink-0">
              <span className="flex items-center gap-1"><FileText size={14} /> Bandeja <span className="text-[9px] font-normal normal-case ml-1">(Clickea para asignar)</span></span>
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
                      'bg-[#1E293B] border-slate-700/50 hover:bg-slate-700'
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

          <div 
            onClick={() => selectedTaskId && handleIceboxDrop({ preventDefault: () => {} } as any)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleIceboxDrop}
            className={`h-24 md:h-32 shrink-0 border-2 border-dashed rounded-xl flex flex-col overflow-hidden transition-colors cursor-pointer ${
              selectedTaskId ? 'border-blue-500 bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-600/50 bg-slate-900/50 hover:border-blue-500/50'
            }`}
          >
            <h2 className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between p-1.5 md:p-2 bg-slate-800/80">
              <span className="flex items-center gap-1"><Archive size={12} /> Para Después</span>
              <span className="bg-slate-700 px-1.5 py-0.5 rounded text-white">{icebox.length}</span>
            </h2>
            <div className="flex-1 flex items-center justify-center p-2 text-center relative">
              {icebox.length === 0 ? (
                <p className="text-[9px] md:text-[10px] text-slate-600 font-medium px-2 leading-tight">
                  {selectedTaskId ? "¡Clickea aquí para archivar!" : "Arrastra aquí las tareas que NO aportan."}
                </p>
              ) : (
                <div className="absolute inset-0 p-2 overflow-y-auto custom-scrollbar flex flex-wrap gap-1 content-start">
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
            
            {/* RANKING (Leaderboard) */}
            {leaderboard.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left border border-slate-700/50 overflow-x-auto">
                 <h4 className="font-bold text-white mb-3 uppercase text-[10px] tracking-wider flex items-center gap-1"><Trophy size={12} className="text-amber-400"/> Salón de la Fama Corporativo</h4>
                 <table className="w-full text-xs text-left text-slate-400">
                    <thead className="text-[9px] uppercase bg-slate-900/50 text-slate-500">
                       <tr>
                          <th className="px-2 py-1.5 rounded-l-md">Rank</th>
                          <th className="px-2 py-1.5">Líder</th>
                          <th className="px-2 py-1.5">Puntos</th>
                          <th className="px-2 py-1.5">Burnouts</th>
                          <th className="px-2 py-1.5">Errores Asign.</th>
                          <th className="px-2 py-1.5 rounded-r-md">Vidas G.</th>
                       </tr>
                    </thead>
                    <tbody>
                       {leaderboard.map((entry, i) => (
                          <tr key={i} className={`border-b border-slate-700/50 last:border-0 ${entry.date === Date.now() ? 'bg-indigo-900/30' : ''}`}>
                             <td className="px-2 py-2 font-bold">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</td>
                             <td className="px-2 py-2 text-white font-medium">{entry.name}</td>
                             <td className="px-2 py-2 text-amber-400 font-bold">{entry.score}</td>
                             <td className="px-2 py-2">{entry.burnouts}</td>
                             <td className="px-2 py-2">{entry.wrongAssignments}</td>
                             <td className="px-2 py-2 text-red-400">{entry.livesLost}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-left mb-6 bg-slate-900/30 p-4 rounded-xl">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1"><CheckCircle size={10} className="inline mr-1"/> Tareas</p>
                <p className="text-lg text-emerald-400 font-medium">{completedTasks}</p>
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
    </div>
  );
}
