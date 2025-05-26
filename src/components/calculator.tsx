"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CalculatorProps {
  className?: string;
}

export default function Calculator({ className }: CalculatorProps) {
  const [display, setDisplay] = useState<string>("");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] =
    useState<boolean>(false);

  const handleButtonClick = (value: string) => {
    if (value === "C") {
      // Clear all
      setDisplay("");
      setFirstOperand(null);
      setOperator(null);
      setWaitingForSecondOperand(false);
      return;
    }

    if (value >= "0" && value <= "9") {
      if (waitingForSecondOperand) {
        setDisplay(value);
        setWaitingForSecondOperand(false);
      } else {
        setDisplay(display === "0" ? value : display + value);
      }
      return;
    }

    if (value === ".") {
      if (!display.includes(".")) {
        setDisplay(display + ".");
      }
      return;
    }

    if (["+", "-", "*", "/", "="].includes(value)) {
      const inputValue = parseFloat(display || "0");

      if (firstOperand === null) {
        setFirstOperand(inputValue);
        setWaitingForSecondOperand(true);
        setOperator(value);
      } else if (operator && !waitingForSecondOperand) {
        let result: number;
        switch (operator) {
          case "+":
            result = firstOperand + inputValue;
            break;
          case "-":
            result = firstOperand - inputValue;
            break;
          case "*":
            result = firstOperand * inputValue;
            break;
          case "/":
            result = firstOperand / inputValue;
            break;
          default:
            result = inputValue;
        }

        setDisplay(String(result));
        setFirstOperand(result);
        setWaitingForSecondOperand(true);
        setOperator(value === "=" ? null : value);
      } else {
        setOperator(value);
      }
    }
  };

  return (
    <div className={`bg-white rounded-md ${className}`}>
      <div className="bg-[#F5F5F5] rounded-xl px-4 py-1">
        <p className="text-right text-lg">{display || "0"}</p>
      </div>

      <p className="text-sm text-[#636566] my-3 text-center">
        Enter amounts or prices to calculate
      </p>

      <div className="grid grid-cols-4 gap-2">
        <Button className="text-lg" onClick={() => handleButtonClick("7")}>
          7
        </Button>
        <Button className="text-lg" onClick={() => handleButtonClick("8")}>
          8
        </Button>
        <Button className="text-lg" onClick={() => handleButtonClick("9")}>
          9
        </Button>
        <Button className="text-lg" onClick={() => handleButtonClick("+")}>
          +
        </Button>

        <Button className="text-lg" onClick={() => handleButtonClick("4")}>
          4
        </Button>
        <Button className="text-lg" onClick={() => handleButtonClick("5")}>
          5
        </Button>
        <Button className="text-lg" onClick={() => handleButtonClick("6")}>
          6
        </Button>
        <Button className="text-lg" onClick={() => handleButtonClick("-")}>
          -
        </Button>

        <Button className="text-lg" onClick={() => handleButtonClick("1")}>
          1
        </Button>
        <Button className="text-lg" onClick={() => handleButtonClick("2")}>
          2
        </Button>
        <Button className="text-lg" onClick={() => handleButtonClick("3")}>
          3
        </Button>
        <Button className="text-lg" onClick={() => handleButtonClick("*")}>
          *
        </Button>

        <Button className="text-lg" onClick={() => handleButtonClick("C")}>
          C
        </Button>
        <Button className="text-lg" onClick={() => handleButtonClick("0")}>
          0
        </Button>
        <Button className="text-lg" onClick={() => handleButtonClick("=")}>
          =
        </Button>
        <Button className="text-lg" onClick={() => handleButtonClick("/")}>
          /
        </Button>
      </div>
    </div>
  );
}
