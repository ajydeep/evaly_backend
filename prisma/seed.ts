import { PrismaClient, QuestionType, Difficulty } from '@prisma/client'
import bcrypt from 'bcryptjs'
import process from 'process'

const prisma = new PrismaClient()

async function main() {
  console.log(' ---> Seeding database...')

  //SUBJECTS
  const os = await prisma.subject.upsert({
    where: { code: 'OS' },
    update: {},
    create: { name: 'Operating Systems', code: 'OS' },
  })

  const dbms = await prisma.subject.upsert({
    where: { code: 'DBMS' },
    update: {},
    create: { name: 'Database Management Systems', code: 'DBMS' },
  })

  const algo = await prisma.subject.upsert({
    where: { code: 'ALGO' },
    update: {},
    create: { name: 'Algorithms', code: 'ALGO' },
  })

  const cn = await prisma.subject.upsert({
    where: { code: 'CN' },
    update: {},
    create: { name: 'Computer Networks', code: 'CN' },
  })




  console.log('---> Subjects created')

  //CONCEPTS
  const deadlock = await prisma.concept.upsert({
    where: { name_subjectId: { name: 'Deadlock', subjectId: os.id } },
    update: {},
    create: { name: 'Deadlock', subjectId: os.id },
  })

  const paging = await prisma.concept.upsert({
    where: { name_subjectId: { name: 'Paging', subjectId: os.id } },
    update: {},
    create: { name: 'Paging', subjectId: os.id },
  })

  const virtualMemory = await prisma.concept.upsert({
    where: { name_subjectId: { name: 'Virtual Memory', subjectId: os.id } },
    update: {},
    create: { name: 'Virtual Memory', subjectId: os.id },
  })  

  const scheduling = await prisma.concept.upsert({
    where: { name_subjectId: { name: 'CPU Scheduling', subjectId: os.id } },
    update: {},
    create: { name: 'CPU Scheduling', subjectId: os.id },
  })

  const sqlJoins = await prisma.concept.upsert({
    where: { name_subjectId: { name: 'SQL Joins', subjectId: dbms.id } },
    update: {},
    create: { name: 'SQL Joins', subjectId: dbms.id },
  })

  const normalization = await prisma.concept.upsert({
    where: { name_subjectId: { name: 'Normalization', subjectId: dbms.id } },
    update: {},
    create: { name: 'Normalization', subjectId: dbms.id },
  })

  const sorting = await prisma.concept.upsert({
    where: { name_subjectId: { name: 'Sorting Algorithms', subjectId: algo.id } },
    update: {},
    create: { name: 'Sorting Algorithms', subjectId: algo.id },
  })

  const dp = await prisma.concept.upsert({
    where: { name_subjectId: { name: 'Dynamic Programming', subjectId: algo.id } },
    update: {},
    create: { name: 'Dynamic Programming', subjectId: algo.id },
  })

  const tcp = await prisma.concept.upsert({
    where: { name_subjectId: { name: 'TCP Protocol', subjectId: cn.id } },
    update: {},
    create: { name: 'TCP Protocol', subjectId: cn.id },
  })

  const routing = await prisma.concept.upsert({
    where: { name_subjectId: { name: 'Routing Algorithms', subjectId: cn.id } },
    update: {},
    create: { name: 'Routing Algorithms', subjectId: cn.id },
  })

  const flowControl = await prisma.concept.upsert({
    where: { name_subjectId: { name: 'Flow Control', subjectId: cn.id } },
    update: {},
    create: { name: 'Flow Control', subjectId: cn.id },
  })



// MORE CONCEPTS -----  



  console.log('--->Concepts created')


  // QUESTIONS 
  const questions = [
    // OS - Deadlock
    {
      text: 'Which of the following conditions is NOT necessary for a deadlock to occur?',
      type: QuestionType.MCQ,
      difficulty: Difficulty.MEDIUM,
      marks: 2,
      negativeMarks: 0.67,
      subjectId: os.id,
      conceptId: deadlock.id,
      explanation: 'The four necessary conditions for deadlock are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Starvation is NOT a necessary condition — it can occur independently without deadlock.',
      options: [
        { text: 'Mutual Exclusion', isCorrect: false, order: 1 },
        { text: 'Hold and Wait', isCorrect: false, order: 2 },
        { text: 'Starvation', isCorrect: true, order: 3 },
        { text: 'Circular Wait', isCorrect: false, order: 4 },
      ],
      hints: [
        { text: 'Think about the 4 Coffman conditions for deadlock.', order: 1 },
        { text: 'Starvation means a process waits indefinitely — is that the same as deadlock?', order: 2 },
      ],
    },
    {
      text: 'A system has 3 processes and 4 resources of the same type. Each process needs at most 2 resources. Can this system deadlock?',
      type: QuestionType.MCQ,
      difficulty: Difficulty.HARD,
      marks: 2,
      negativeMarks: 0.67,
      subjectId: os.id,
      conceptId: deadlock.id,
      explanation: 'With 4 resources and 3 processes each needing at most 2, even if each process holds 1 resource (3 total held), there is still 1 resource remaining which can be given to any process to complete. Deadlock is impossible.',
      options: [
        { text: 'Yes, deadlock is possible', isCorrect: false, order: 1 },
        { text: 'No, deadlock is not possible', isCorrect: true, order: 2 },
        { text: 'Depends on the scheduling algorithm', isCorrect: false, order: 3 },
        { text: 'Depends on the order of resource requests', isCorrect: false, order: 4 },
      ],
      hints: [
        { text: 'Consider the worst case: what is the maximum resources each process could hold before deadlock?', order: 1 },
        { text: 'If each process holds (max_need - 1) resources, how many total resources are held? Are there enough left to satisfy one process?', order: 2 },
      ],
    },
    {
      text: 'In Banker\'s Algorithm, what does the "Need" matrix represent?',
      type: QuestionType.MCQ,
      difficulty: Difficulty.EASY,
      marks: 1,
      negativeMarks: 0.33,
      subjectId: os.id,
      conceptId: deadlock.id,
      explanation: 'Need[i][j] = Max[i][j] - Allocation[i][j]. It represents how many more resources of each type process i may still request before completing.',
      options: [
        { text: 'Resources currently allocated to each process', isCorrect: false, order: 1 },
        { text: 'Maximum resources each process will ever need', isCorrect: false, order: 2 },
        { text: 'Additional resources each process may still request', isCorrect: true, order: 3 },
        { text: 'Available resources in the system', isCorrect: false, order: 4 },
      ],
      hints: [
        { text: 'Think about the formula: Need = Max - Allocation', order: 1 },
      ],
    },


    // OS - CPU Scheduling
    {
      text: 'Which scheduling algorithm can cause starvation?',
      type: QuestionType.MULTI,
      difficulty: Difficulty.MEDIUM,
      marks: 2,
      negativeMarks: 0.67,
      subjectId: os.id,
      conceptId: scheduling.id,
      explanation: 'Priority Scheduling causes starvation because low-priority processes may never execute if high-priority processes keep arriving. SJF (preemptive) can also starve long processes. Round Robin and FCFS cannot cause starvation.',
      options: [
        { text: 'Round Robin', isCorrect: false, order: 1 },
        { text: 'Priority Scheduling (preemptive)', isCorrect: true, order: 2 },
        { text: 'FCFS', isCorrect: false, order: 3 },
        { text: 'Shortest Job First (preemptive)', isCorrect: true, order: 4 },
      ],
      hints: [
        { text: 'Starvation occurs when a process waits indefinitely. Which algorithms could theoretically skip a process forever?', order: 1 },
        { text: 'FCFS processes in order — can it skip anyone? Round Robin gives everyone a turn — can it skip anyone?', order: 2 },
      ],
    },
    {
      text: 'In Round Robin scheduling with time quantum = 4ms, processes arrive as: P1(0ms,8ms), P2(1ms,4ms), P3(2ms,9ms). What is the average waiting time?',
      type: QuestionType.NAT,
      difficulty: Difficulty.HARD,
      marks: 2,
      negativeMarks: 0,
      subjectId: os.id,
      conceptId: scheduling.id,
      natAnswer: 11,
      explanation: 'Gantt Chart: P1(0-4), P2(4-8), P3(8-12), P1(12-16), P3(16-21). Waiting times: P1 = (12-4) = 8ms. P2 = (4-1) = 3ms. P3 = (16-12) + (8-2) = 4+6 = wait calculated as: total_time - burst - arrival. P3 finishes at 21, burst=9, arrived=2. Wait = 21-9-2 = 10ms. Avg = (8+3+10)/3 ≈ 7ms. Note: calculate carefully with your own Gantt chart.',
      options: [],
      hints: [
        { text: 'Draw the Gantt Chart first. With quantum=4: P1 runs 0-4, then who runs next?', order: 1 },
        { text: 'Waiting time = Turnaround time - Burst time. Turnaround = Completion - Arrival.', order: 2 },
      ],
    },


    // DBMS - SQL Joins
    {
      text: 'What does a LEFT JOIN return when there is no matching row in the right table?',
      type: QuestionType.MCQ,
      difficulty: Difficulty.EASY,
      marks: 1,
      negativeMarks: 0.33,
      subjectId: dbms.id,
      conceptId: sqlJoins.id,
      explanation: 'A LEFT JOIN returns all rows from the left table. For rows with no match in the right table, NULL is returned for all columns of the right table.',
      options: [
        { text: 'The row is excluded from results', isCorrect: false, order: 1 },
        { text: 'NULL is returned for right table columns', isCorrect: true, order: 2 },
        { text: 'The row is duplicated', isCorrect: false, order: 3 },
        { text: 'An error is raised', isCorrect: false, order: 4 },
      ],
      hints: [
        { text: 'Think about what "LEFT" means — which table\'s rows are preserved completely?', order: 1 },
      ],
    },
    {
      text: 'Which of the following SQL joins can produce a Cartesian product if no ON condition is specified?',
      type: QuestionType.MCQ,
      difficulty: Difficulty.MEDIUM,
      marks: 2,
      negativeMarks: 0.67,
      subjectId: dbms.id,
      conceptId: sqlJoins.id,
      explanation: 'CROSS JOIN always produces a Cartesian product — every row of table A combined with every row of table B. INNER JOIN without a condition also produces a Cartesian product, making them equivalent in that case.',
      options: [
        { text: 'INNER JOIN only', isCorrect: false, order: 1 },
        { text: 'CROSS JOIN only', isCorrect: false, order: 2 },
        { text: 'Both CROSS JOIN and INNER JOIN (without ON)', isCorrect: true, order: 3 },
        { text: 'LEFT JOIN only', isCorrect: false, order: 4 },
      ],
      hints: [
        { text: 'Which join type is explicitly designed to produce all combinations?', order: 1 },
      ],
    },


    // DBMS - Normalization
    {
      text: 'A relation is in 2NF if it is in 1NF and every non-prime attribute is:',
      type: QuestionType.MCQ,
      difficulty: Difficulty.MEDIUM,
      marks: 2,
      negativeMarks: 0.67,
      subjectId: dbms.id,
      conceptId: normalization.id,
      explanation: '2NF eliminates partial dependencies. Every non-prime attribute (not part of any candidate key) must be fully functionally dependent on the entire primary key, not just part of it.',
      options: [
        { text: 'Fully functionally dependent on the primary key', isCorrect: true, order: 1 },
        { text: 'Dependent on another non-prime attribute', isCorrect: false, order: 2 },
        { text: 'Partially dependent on the primary key', isCorrect: false, order: 3 },
        { text: 'Independent of the primary key', isCorrect: false, order: 4 },
      ],
      hints: [
        { text: '2NF removes partial dependencies. A partial dependency means an attribute depends on only PART of a composite key.', order: 1 },
      ],
    },
    {
      text: 'Table: Student(StudentID, CourseID, StudentName, CourseName, Grade). Which functional dependencies indicate this is NOT in 2NF?',
      type: QuestionType.MULTI,
      difficulty: Difficulty.HARD,
      marks: 2,
      negativeMarks: 0.67,
      subjectId: dbms.id,
      conceptId: normalization.id,
      explanation: 'The primary key is (StudentID, CourseID). StudentName depends only on StudentID — partial dependency. CourseName depends only on CourseID — partial dependency. Grade depends on the full key (StudentID, CourseID) — this is fine. These partial dependencies violate 2NF.',
      options: [
        { text: 'StudentID → StudentName', isCorrect: true, order: 1 },
        { text: 'CourseID → CourseName', isCorrect: true, order: 2 },
        { text: '(StudentID, CourseID) → Grade', isCorrect: false, order: 3 },
        { text: 'StudentID → Grade', isCorrect: false, order: 4 },
      ],
      hints: [
        { text: 'The composite primary key is (StudentID, CourseID). Which attributes depend on the WHOLE key vs just part of it?', order: 1 },
      ],
    },

    // Algorithms - Sorting
    {
      text: 'Which sorting algorithm has the best worst-case time complexity?',
      type: QuestionType.MCQ,
      difficulty: Difficulty.EASY,
      marks: 1,
      negativeMarks: 0.33,
      subjectId: algo.id,
      conceptId: sorting.id,
      explanation: 'Merge Sort guarantees O(n log n) in ALL cases — best, average, and worst. Quick Sort is O(n²) in the worst case. Heap Sort is also O(n log n) worst case, but Merge Sort is more commonly cited for stable sorting.',
      options: [
        { text: 'Quick Sort', isCorrect: false, order: 1 },
        { text: 'Merge Sort', isCorrect: true, order: 2 },
        { text: 'Bubble Sort', isCorrect: false, order: 3 },
        { text: 'Insertion Sort', isCorrect: false, order: 4 },
      ],
      hints: [
        { text: 'Think about algorithms that use divide and conquer consistently.', order: 1 },
      ],
    },
    {
      text: 'What is the space complexity of Merge Sort?',
      type: QuestionType.MCQ,
      difficulty: Difficulty.MEDIUM,
      marks: 2,
      negativeMarks: 0.67,
      subjectId: algo.id,
      conceptId: sorting.id,
      explanation: 'Merge Sort requires O(n) auxiliary space for the temporary arrays used during merging. This is its main disadvantage compared to in-place algorithms like Quick Sort (O(log n) stack space).',
      options: [
        { text: 'O(1)', isCorrect: false, order: 1 },
        { text: 'O(log n)', isCorrect: false, order: 2 },
        { text: 'O(n)', isCorrect: true, order: 3 },
        { text: 'O(n log n)', isCorrect: false, order: 4 },
      ],
      hints: [
        { text: 'Merge Sort creates temporary arrays during the merge step. How large are these temporary arrays in total?', order: 1 },
      ],
    },
    {
      text: 'For an array that is almost sorted (only a few elements out of place), which algorithm performs best in practice?',
      type: QuestionType.MCQ,
      difficulty: Difficulty.MEDIUM,
      marks: 2,
      negativeMarks: 0.67,
      subjectId: algo.id,
      conceptId: sorting.id,
      explanation: 'Insertion Sort has best-case O(n) for nearly sorted arrays — it only performs swaps when it finds an element out of place. With very few elements out of place, almost no swaps happen.',
      options: [
        { text: 'Merge Sort', isCorrect: false, order: 1 },
        { text: 'Heap Sort', isCorrect: false, order: 2 },
        { text: 'Insertion Sort', isCorrect: true, order: 3 },
        { text: 'Selection Sort', isCorrect: false, order: 4 },
      ],
      hints: [
        { text: 'Which algorithm\'s performance directly depends on how "unsorted" the array is?', order: 1 },
      ],
    },

    // Algorithms - DP
    {
      text: 'What is the time complexity of finding the nth Fibonacci number using dynamic programming (bottom-up)?',
      type: QuestionType.MCQ,
      difficulty: Difficulty.EASY,
      marks: 1,
      negativeMarks: 0.33,
      subjectId: algo.id,
      conceptId: dp.id,
      explanation: 'Bottom-up DP computes each Fibonacci value once from F(0) to F(n), making n iterations total. Time complexity is O(n) with O(n) space (or O(1) if optimized to store only last two values).',
      options: [
        { text: 'O(2^n)', isCorrect: false, order: 1 },
        { text: 'O(n²)', isCorrect: false, order: 2 },
        { text: 'O(n)', isCorrect: true, order: 3 },
        { text: 'O(log n)', isCorrect: false, order: 4 },
      ],
      hints: [
        { text: 'How many subproblems does bottom-up DP solve, and is each solved more than once?', order: 1 },
      ],
    },
    {
      text: 'The 0/1 Knapsack problem with n items and capacity W has a DP table of size n×W. What is its time complexity?',
      type: QuestionType.MCQ,
      difficulty: Difficulty.MEDIUM,
      marks: 2,
      negativeMarks: 0.67,
      subjectId: algo.id,
      conceptId: dp.id,
      explanation: 'The DP table has n rows (one per item) and W+1 columns (capacities 0 to W). We fill each cell in O(1) time, so total time complexity is O(nW). This is pseudo-polynomial — polynomial in W but W can be exponential in the number of bits.',
      options: [
        { text: 'O(n²)', isCorrect: false, order: 1 },
        { text: 'O(nW)', isCorrect: true, order: 2 },
        { text: 'O(2^n)', isCorrect: false, order: 3 },
        { text: 'O(n log W)', isCorrect: false, order: 4 },
      ],
      hints: [
        { text: 'Think about the size of the DP table — how many cells are there, and how long does each cell take to compute?', order: 1 },
      ],
    },
  ]


 // MORE QUESTIONS -----







  // CREATE QUESTIONS 
  for (const q of questions) {
    const { options, hints, ...questionData } = q

    const created = await prisma.question.create({
      data: {
        ...questionData,
        options: {
          create: options,
        },
        hints: {
          create: hints,
        },
      },
    })

    console.log(`---> Question created: ${created.id} | ${created.type} | ${created.difficulty}`)
  }




  // DEMO USER

  await prisma.user.upsert({
    where: { email: 'aryatyagi@gmail.com' },
    update: {},
    create: {
      name: 'Arya Tyagi',
      email: 'aryatyagi@gmail.com',
      password: await bcrypt.hash('Test@123', 10),
      role: 'STUDENT',
    },
  })


  await prisma.user.upsert({
    where: { email: 'ajaydeep@gmail.com' },
    update: {},
    create: {
      name: 'Ajaydeep',
      email: 'ajaydeep@gmail.com',
      password: await bcrypt.hash('Test@123', 10),
      role: 'STUDENT',
    },
  })


  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: await bcrypt.hash('Admin@123', 10),
      role: 'ADMIN',
    },
  })



  console.log('---> Demo users created')
  console.log('')
  console.log(' Seeding complete!')
  console.log(' Student login → arya@gmail.com / Test@123')
  console.log(' Admin login   → admin@gmail.com / Admin@123')
}



main()
  .catch((e) => {
    console.error('=== Seed failed: ===', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })