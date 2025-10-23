import { SparklesText } from "@/components/ui/sparkles-text";

interface SampleQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  animatingIndices?: Set<number>;
}

export default function SampleQuestions({ questions, onQuestionClick, animatingIndices = new Set() }: SampleQuestionsProps) {
  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="text-center mb-8">
        <div className="mb-4">
          <SparklesText 
            text="GoldBot"
            colors={{ first: "#F5C344", second: "#FBBF24" }}
            sparklesCount={8}
            className=""
          />
        </div>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
          Have a question about precious metals? I can help you with that.
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-6">
          Here are a few to help get you started
        </p>
      </div>
      
      <div className="flex flex-col gap-3">
        {questions.map((question, index) => {
          const isAnimating = animatingIndices.has(index);
          return (
            <button
              key={`${question}-${index}`}
              onClick={() => onQuestionClick(question)}
              style={{ 
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards'
              }}
              className={`group p-5 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-yellow-500 dark:hover:border-yellow-600 hover:shadow-lg hover:scale-[1.02] w-full cursor-pointer transition-all duration-300 ${
                isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <span className="text-base text-zinc-900 dark:text-zinc-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-500">
                {question}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

