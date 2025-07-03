import { FC, ReactNode } from "react";

interface ActionCardProps {
  variant?: "default" | "primary" | "secondary";
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  description: string;
  buttonText: string;
  onClick?: () => void;
}

const ActionCard: FC<ActionCardProps> = ({
  variant = "default",
  icon,
  iconBgColor,
  iconColor,
  title,
  description,
  buttonText,
  onClick,
}) => {
  const getCardClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl";
      case "secondary":
        return "bg-white/95 backdrop-blur-sm shadow-lg border border-white/20";
      default:
        return "bg-white/95 backdrop-blur-sm shadow-lg border border-white/20";
    }
  };

  const getButtonClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-white text-blue-600 hover:bg-gray-50 shadow-md";
      case "secondary":
        return "bg-blue-600 text-white hover:bg-blue-700 shadow-md";
      default:
        return "bg-blue-600 text-white hover:bg-blue-700 shadow-md";
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case "primary":
        return "text-white";
      case "secondary":
        return "text-gray-800";
      default:
        return "text-gray-800";
    }
  };

  const getDescriptionClasses = () => {
    switch (variant) {
      case "primary":
        return "text-white/90";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className={`rounded-2xl p-6 h-full flex flex-col ${getCardClasses()}`}>
      <div
        className={`w-14 h-14 rounded-2xl ${iconBgColor} flex items-center justify-center mb-4 shadow-sm`}
      >
        <div className={`${iconColor}`}>{icon}</div>
      </div>
      
      <h2 className={`text-xl font-bold mb-3 ${getTextClasses()}`}>
        {title}
      </h2>
      
      <p className={`text-sm mb-6 flex-grow ${getDescriptionClasses()}`}>
        {description}
      </p>
      
      <button
        onClick={onClick}
        className={`w-full ${getButtonClasses()} h-12 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02]`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ActionCard;