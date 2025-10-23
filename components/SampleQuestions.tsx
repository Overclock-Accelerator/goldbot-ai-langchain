interface SampleQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export default function SampleQuestions({ questions, onQuestionClick }: SampleQuestionsProps) {
  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 bg-clip-text text-transparent mb-3">
          I&apos;m GoldBot
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Ask me about precious metals.
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-4">
          Here are a few to help get you started
        </p>
      </div>
      
      <div className="flex flex-col gap-3 max-w-2xl mx-auto">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="group p-4 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-yellow-500 dark:hover:border-yellow-600 hover:shadow-md transition-all duration-200 w-full"
          >
            <span className="text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-500">
              {question}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

