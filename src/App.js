import { useEffect, useState } from 'react';
import supabase from './supabase';
import './style.css'

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

const initialFacts = [
  {
    id: 1,
    text: "React is being developed by Meta (formerly facebook)",
    source: "https://opensource.fb.com/",
    category: "technology",
    votesInteresting: 24,
    votesMindblowing: 9,
    votesFalse: 4,
    createdIn: 2021,
  },
  {
    id: 2,
    text: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
    source:
      "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
    category: "society",
    votesInteresting: 11,
    votesMindblowing: 2,
    votesFalse: 0,
    createdIn: 2019,
  },
  {
    id: 3,
    text: "Lisbon is the capital of Portugal",
    source: "https://en.wikipedia.org/wiki/Lisbon",
    category: "society",
    votesInteresting: 8,
    votesMindblowing: 3,
    votesFalse: 1,
    createdIn: 2015,
  },
];

function App() {

  //defining State
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);

  useEffect(function() {
    async function getFacts(){
      let { data: facts, error } = await supabase
      .from('facts')
      .select('*');
      setFacts(facts);
    }
    getFacts();
  },[])

 
  return (
    <>
    <Header show={showForm} setShowForm={setShowForm}/>
      {/* Using State variable */}
        {showForm ? <NewFactForm setFacts={setFacts} setShowForm={setShowForm}/> : null}
      <main className="main">
        <CategoryFilter/>
        <FactList facts={facts}/>
        </main>      

    </>
  );
}

function Header({show, setShowForm}){
  const appTitle="Fact O Mania"
  return(
    <header className="header">
    <div className="logo">
      <img src="logo.png" height="68" width="68" alt="image-logo" />
      <h1>{appTitle}</h1>
    </div>                                            {/* Updating State */}
    <button className="btn btn-large btn-open" onClick={() => setShowForm((show) => !show)}>{show ? 'Close' :'Share a Fact' }</button>
  </header>
  );
}

function isValidHttpUrl(string) {
  let url;
  
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({setFacts, setShowForm}){

  const [text, setText]  = useState("");
  const [source, setSource] = useState("http://a.com");
  const [category, setCategory] = useState("");
  const textLength = text.length;

  function handleSubmit(e){
    e.preventDefault();
    
    if(text && isValidHttpUrl(source) && category && textLength <= 200){
      // console.log("valid");

      //Creating new fact object
      const newFact = {
        id: Math.round(Math.random()*10000000),
        text,
        source,
        category,
        votesInteresting: 0,
        votesMindblowing: 0,
        votesFalse: 0,
        createdIn: new Date().getFullYear(),
      };

      //Adding the new fact in the UI
      setFacts((facts) => [newFact, ...facts]);

      //Resetting the form
      setText("");
      setSource("");
      setCategory("");

      //closing the form
      setShowForm(false);

    }
  }

  return(
    <form className="fact-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Share a Fact ..." value={text} onChange={(e) => setText(e.target.value)}/>
        <span>{200 - textLength}</span>
        <input type="text" placeholder="Trusted Source..." value={source} onChange={(e) => setSource(e.target.value)}/>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Choose Category:</option>
          {CATEGORIES.map((cat)=>(<option key={cat.name} value={cat.name} >{cat.name.toUpperCase()}</option>))}
        </select>
        <button className="btn btn-large">Post</button>
      </form>
  );
}

function CategoryFilter(){
  return(
    <aside>
      <ul>
      <li className="category">
        <button className="btn btn-all-category" style={{width:'100%'}}>All</button>
      </li>

      {CATEGORIES.map((cat)=>(
      <li key={cat.name} className="category">
        <button className="btn btn-category" style={{backgroundColor: cat.color}}>
        {cat.name}
       </button>
      </li>
      ))}
      </ul>
  </aside>
  );
}

function FactList({facts}){

  
  return(
    <section>
      <ul className="facts-list">
          {
            facts.map((factObj)=><Fact key={factObj.id} fact={factObj}/>) //fact act like a parametere and there can be more than one. It is called props
          }
      </ul>
      <p>There are {facts.length} Facts in the Database. Add your own ! </p>
    </section>
  );
}

function Fact({fact}){
  return(
    <li className="fact">
              <p>
                {fact.text}
                <a
                  className="source"
                  href={fact.source}
                  target="_blank"
                  >(Source)</a
                >
              </p>
              <span className="tag" style={{backgroundColor: CATEGORIES.find((cat)=>cat.name===fact.category).color,}}>{fact.category}</span>
              <div className="vote-buttons">
                <button>👍 {fact.votesinteresting}</button>
                <button>🤯 {fact.votesmindblowing}</button>
                <button>⛔️ {fact.votesfalse}</button>
              </div>
            </li>
  );
}

export default App;
