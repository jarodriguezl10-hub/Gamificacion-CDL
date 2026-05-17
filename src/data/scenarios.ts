export type Option = {
  id: string;
  text: string;
  impact: {
    morale: number;
    trust: number;
  };
  feedback: string;
};

export type Scenario = {
  id: string;
  sender: string;
  avatar: string;
  role: string;
  message: string;
  timeLimitSeconds: number;
  options: Option[];
};

export const scenarios: Scenario[] = [
  {
    id: "s1",
    sender: "Carlos",
    avatar: "👨‍💻",
    role: "Dev Frontend",
    message: "¡Jefe! Subí un bug a producción y el sistema de pagos está caído. El cliente VIP está furioso. ¿Qué hago?",
    timeLimitSeconds: 20,
    options: [
      {
        id: "s1_a",
        text: "¡¿Cómo pudiste?! Arréglalo YA MISMO o habrá consecuencias.",
        impact: { morale: -40, trust: 0 },
        feedback: "Destruiste la moral de Carlos. El pánico no resuelve el bug más rápido."
      },
      {
        id: "s1_b",
        text: "Tranquilo, todos fallamos. Ve a descansar, yo hablaré con el cliente.",
        impact: { morale: +10, trust: -40 },
        feedback: "Fuiste muy blando. El cliente sintió que no le diste urgencia al problema."
      },
      {
        id: "s1_c",
        text: "Revisemos juntos el fallo, haz rollback y yo le daré un ETA al cliente.",
        impact: { morale: +10, trust: +20 },
        feedback: "¡Excelente! Solución rápida, apoyaste a tu equipo y gestionaste al cliente."
      }
    ]
  },
  {
    id: "s2",
    sender: "Alerta del Sistema",
    avatar: "🚨",
    role: "DevOps Bot",
    message: "CRÍTICO: El servidor principal ha superado el 99% de CPU. Simultáneamente, tienes un correo no leído del CEO preguntando por un reporte.",
    timeLimitSeconds: 15,
    options: [
      {
        id: "s2_a",
        text: "Responder al CEO inmediatamente para no quedar mal.",
        impact: { morale: -20, trust: -30 },
        feedback: "El servidor se cayó mientras escribías. Priorizaste la jerarquía sobre el fuego real."
      },
      {
        id: "s2_b",
        text: "Atender la caída del servidor y luego escribir al CEO.",
        impact: { morale: +15, trust: +20 },
        feedback: "Priorización perfecta (Matriz Eisenhower). Lo urgente e importante primero."
      },
      {
        id: "s2_c",
        text: "Pedirle a un dev Junior que apague el servidor.",
        impact: { morale: -30, trust: -20 },
        feedback: "Delegaste una tarea crítica a alguien sin experiencia bajo presión."
      }
    ]
  },
  {
    id: "s3",
    sender: "Ana",
    avatar: "👩‍💼",
    role: "Product Manager",
    message: "Hola. Siento que en las reuniones Luis habla demasiado y no me deja exponer mis ideas. Estoy frustrada.",
    timeLimitSeconds: 25,
    options: [
      {
        id: "s3_a",
        text: "Hablaré con Luis y le diré que se calle un poco.",
        impact: { morale: -20, trust: -10 },
        feedback: "Agresividad. Resolverás el problema de Ana creando un conflicto con Luis."
      },
      {
        id: "s3_b",
        text: "Quizás debes ser más proactiva e interrumpirlo tú también.",
        impact: { morale: -30, trust: -10 },
        feedback: "Invalidaste los sentimientos de Ana y promoviste una cultura tóxica."
      },
      {
        id: "s3_c",
        text: "Gracias por avisarme. Daré feedback a Luis para asegurar que todos tengan espacio.",
        impact: { morale: +30, trust: +10 },
        feedback: "Asertividad. Validaste a Ana y tomaste responsabilidad como líder."
      }
    ]
  }
];
