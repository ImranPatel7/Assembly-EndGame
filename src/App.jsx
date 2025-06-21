import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { languages } from "./languages";
import { getFarewellText, getRandomWord } from "./utils";
// import ReactConfetti from "react-confetti";

const App = () => {
  // ====== State Variables ======

  // Word the user is currently trying to guess
  const [currentWord, setCurrentWord] = useState(() => getRandomWord());

  // Letters the user has guessed so far
  const [guessedLetters, setGuessedLetters] = useState([]);

  // Current streak of correct guesses
  const [currentStreak, setCurrentStreak] = useState(0);

  // Best streak stored in localStorage
  const [bestStreak, setBestStreak] = useState(() => {
    return Number(localStorage.getItem("bestStreak")) || 0;
  });

  // Used to prevent multiple updates to streak in a single game
  const [hasStreakUpdated, setHasStreakUpdated] = useState(false);

  // Tracks if hint was used in the current streak
  const [hintUsedInStreak, setHintUsedInStreak] = useState(false);

  // ====== Game Calculations ======
  const numGuessesLeft = languages.length - 1;
  const wrongGuessCount = guessedLetters.filter(
    (letter) => !currentWord.includes(letter)
  ).length;
  const isGameWon = currentWord
    .split("")
    .every((letter) => guessedLetters.includes(letter));
  const isGameLost = wrongGuessCount >= numGuessesLeft;
  const isGameOver = isGameWon || isGameLost;
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];
  const isLastGuessIncorrect =
    lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

  // ====== Keyboard Letter Input ======
  useEffect(() => {
    function handleKeyDown(e) {
      const key = e.key.toLowerCase();

      // Only accept a-z letters and ignore if game is over
      if (key.match(/^[a-z]$/) && !isGameOver) {
        addGuessedLetter(key);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [guessedLetters, isGameOver]);

  // ====== Streak Update Logic ======
  useEffect(() => {
    if (isGameWon && !hasStreakUpdated) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);

      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        localStorage.setItem("bestStreak", newStreak);
      }
      setHasStreakUpdated(true);
    }

    if (isGameLost && !hasStreakUpdated) {
      setCurrentStreak(0);
      setHintUsedInStreak(false); // Reset hint usage on streak break
      setHasStreakUpdated(true);
    }
  }, [isGameWon, isGameLost, currentStreak, bestStreak, hasStreakUpdated]);

  // ====== Auto-start new game on win ======
  useEffect(() => {
    if (isGameWon) {
      const timeout = setTimeout(() => {
        // console.log("Auto-starting next game...");
        startNewGame();
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isGameWon]);

  // ====== Helper Functions ======
  function addGuessedLetter(letter) {
    setGuessedLetters((prevLetters) =>
      prevLetters.includes(letter) ? prevLetters : [...prevLetters, letter]
    );
  }

  function useHint() {
    if (hintUsedInStreak || isGameOver) return;

    const unguessedLetters = currentWord
      .split("")
      .filter((l) => !guessedLetters.includes(l));

    if (unguessedLetters.length === 0) return;

    const randomLetter =
      unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];

    addGuessedLetter(randomLetter);
    setHintUsedInStreak(true);
  }

  function startNewGame() {
    setCurrentWord(getRandomWord());
    setGuessedLetters([]);
    setHasStreakUpdated(false);
  }

  // ====== Render Language Chips ======
  const languageElements = languages.map((lang, index) => {
    const isLanguageLost = index < wrongGuessCount;
    const styles = {
      backgroundColor: lang.backgroundColor,
      color: lang.color,
    };
    const className = clsx("chip", isLanguageLost && "lost");
    return (
      <span className={className} style={styles} key={lang.name}>
        {lang.name}
      </span>
    );
  });

  // ====== Render Word Letters ======
  const letterElements = currentWord.split("").map((letter, index) => {
    const shouldRevealLetter = isGameLost || guessedLetters.includes(letter);
    const letterClassName = clsx(
      isGameLost && !guessedLetters.includes(letter) && "missed-letter"
    );
    return (
      <span key={index} className={letterClassName}>
        {shouldRevealLetter ? letter.toUpperCase() : ""}
      </span>
    );
  });

  // ====== Render Custom Keyboard ======
  // const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const rows = [
    "qwertyuiop".split(""),
    "asdfghjkl".split(""),
    "zxcvbnm".split(""),
  ];

  // const keyboardElements = alphabet.split("").map((letter) => {
  //   const isGuessed = guessedLetters.includes(letter);
  //   const isCorrect = isGuessed && currentWord.includes(letter);
  //   const isWrong = isGuessed && !currentWord.includes(letter);
  //   const className = clsx({
  //     correct: isCorrect,
  //     wrong: isWrong,
  //   });
  //   return (
  //     <button
  //       className={className}
  //       key={letter}
  //       disabled={isGameOver}
  //       aria-disabled={guessedLetters.includes(letter)}
  //       aria-label={`Letter ${letter}`}
  //       onClick={() => addGuessedLetter(letter)}
  //     >
  //       {letter.toUpperCase()}
  //     </button>
  //   );
  // });

  const keyboardElements = (
    <div className="keyboard">
      {rows.map((row, rowIndex) => (
        <div className="keyboard-row" key={rowIndex}>
          {row.map((letter) => {
            const isGuessed = guessedLetters.includes(letter);
            const isCorrect = isGuessed && currentWord.includes(letter);
            const isWrong = isGuessed && !currentWord.includes(letter);
            const className = clsx({
              correct: isCorrect,
              wrong: isWrong,
            });
            return (
              <button
                className={className}
                key={letter}
                disabled={isGameOver}
                aria-disabled={guessedLetters.includes(letter)}
                aria-label={`Letter ${letter}`}
                onClick={() => addGuessedLetter(letter)}
              >
                {letter.toUpperCase()}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  // ====== Game Status Message ======
  const gameStatusClass = clsx("game-status", {
    won: isGameWon,
    lost: isGameLost,
    farewell: !isGameOver && isLastGuessIncorrect,
  });

  function renderGameStatus() {
    if (!isGameOver && isLastGuessIncorrect) {
      return (
        <>
          <p className="farewell-message">
            {getFarewellText(languages[wrongGuessCount - 1].name)}
          </p>
        </>
      );
    }

    if (isGameWon) {
      return (
        <>
          <h2>You win!</h2>
          <p>Well done! 🎉</p>
        </>
      );
    }
    if (isGameLost) {
      return (
        <>
          <h2>Game over!</h2>
          <p>You lose! Better start learning Assembly 😭</p>
        </>
      );
    }

    return null;
  }

  // ====== Final Render ======
  return (
    <main>
      <div className="container">
        {/* {isGameWon && <Confetti recycle={false} numberOfPieces={1000} />} */}
        <header>
          <h1>Assembly:EndGame</h1>
          <p>
            Guess the word within 8 attempts to keep the programming world safe
            from Assembly!
          </p>
        </header>
        <section aria-live="polite" role="status" className={gameStatusClass}>
          {renderGameStatus()}
        </section>
        <section className="streak-container">
          <div className="streak-box">Current Streak: {currentStreak}</div>
          <div className="streak-box">Best Streak: {bestStreak}</div>
        </section>
        <section className="language-chips">{languageElements}</section>
        <section className="word">{letterElements}</section>
        {/* Combined visually-hidden aria-live region for status update */}
        <section className="sr-only" aria-live="polite" role="status">
          <p>
            {currentWord.includes(lastGuessedLetter)
              ? `Correct! The letter ${lastGuessedLetter} is in the word.`
              : `Sorry, the letter ${lastGuessedLetter} is not in the word.`}
            You have {numGuessesLeft} attempts left.
          </p>
          <p>
            Current word:{" "}
            {currentWord
              .split("")
              .map((letter) =>
                guessedLetters.includes(letter) ? letter + "." : "blank."
              )
              .join(" ")}
          </p>
        </section>
        <button
          className="hint-button"
          onClick={useHint}
          disabled={hintUsedInStreak || isGameOver}
          title="Use hint (once per streak)"
        >
          💡
        </button>
        <section className="keyboard">{keyboardElements}</section>
        {isGameOver && (
          <button className="new-game" onClick={startNewGame}>
            New Game
          </button>
        )}
      </div>
    </main>
  );
};

export default App;
