import React from "react";
import { languages } from "./languages";

const App = () => {
  const languageElements = languages.map((lang) => {
    const styles = {
      backgroundColor: lang.backgroundColor,
      color: lang.color,
    };
    return (
      <span className="chip" style={styles} key={lang.name}>
        {lang.name}
      </span>
    );
  });

  return (
    <main>
      <header>
        <h1>Assembly:EndGame</h1>
        <p>
          Guess the word within 8 attempts to keep the programming world safe
          from Assembly!
        </p>
      </header>
      <section className="game-status">
        <h2>You Win!</h2>
        <p>..WellDone..</p>
      </section>
      <section className="language-chips">{languageElements} </section>
    </main>
  );
};

export default App;
