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

function Loader(){
  return(
    <div className="loader">
      <div className="loading"></div>
    </div>
  );
  }

function App() {

  //defining State
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  let query = supabase.from('facts').select("*");
  if(currentCategory != "all")
    query = query.eq("category", currentCategory);

  useEffect(function() {
    async function getFacts(){
      setIsLoading(true);
      let { data: facts, error } = await query
      .order("votesinteresting",{ascending : false})
      .limit(1000);
      setFacts(facts);

      if(error)
        alert("Having trouble while fetching data!/Try Reloading...");
      else
        setIsLoading(false);
    }
    getFacts();
  },[currentCategory])

 
  return (
    <>
    <Header show={showForm} setShowForm={setShowForm}/>
      {/* Using State variable */}
        {showForm ? <NewFactForm setFacts={setFacts} setShowForm={setShowForm}/> : null}
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory}/>
        {isLoading ? <Loader/> : <FactList facts={facts} setFacts={setFacts}/>}
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
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const textLength = text.length;
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e){
    e.preventDefault();
    
    if(text && isValidHttpUrl(source) && category && textLength <= 200){
      // console.log("valid");

      //Creating new fact object
      // const newFact = {
      //   id: Math.round(Math.random()*10000000),
      //   text,
      //   source,
      //   category,
      //   votesInteresting: 0,
      //   votesMindblowing: 0,
      //   votesFalse: 0,
      //   createdIn: new Date().getFullYear(),
      // };

      //Disabling the form
      setIsUploading(true);

      //inserting into database
      const {data: newFact, error} = await supabase.from("facts").insert([{text, source, category}]).select();

      //Adding the new fact in the UI
      if(!error)
      setFacts((facts) => [newFact[0], ...facts]);

      //Resetting the form
      setText("");
      setSource("");
      setCategory("");

      //Enabling the form
      setIsUploading(false);

      //closing the form
      setShowForm(false);

    }else{
      alert("Fill up all the fields or check the valid URL");
    }
  }

  return(
    <form className="fact-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Share a Fact ..." value={text} onChange={(e) => setText(e.target.value)} disabled={isUploading}/>
        <span>{200 - textLength}</span>
        <input type="text" placeholder="Trusted Source..." value={source} onChange={(e) => setSource(e.target.value)} disabled={isUploading}/>
        <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={isUploading}>
          <option value="">Choose Category:</option>
          {CATEGORIES.map((cat)=>(<option key={cat.name} value={cat.name} >{cat.name.toUpperCase()}</option>))}
        </select>
        <button className="btn btn-large" disabled={isUploading}>Post</button>
      </form>
  );
}

function CategoryFilter({setCurrentCategory}){
  return(
    <aside>
      <ul>
      <li className="category">
        <button className="btn btn-all-category" style={{width:'100%'}} onClick={()=>setCurrentCategory("all")}>All</button>
      </li>

      {CATEGORIES.map((cat)=>(
      <li key={cat.name} className="category">
        <button className="btn btn-category" style={{backgroundColor: cat.color}} onClick={()=>setCurrentCategory(cat.name)}>
        {cat.name}
       </button>
      </li>
      ))}
      </ul>
  </aside>
  );
}

function FactList({facts, setFacts}){

  if(facts.length===0)
  return(<h2>Be the first one to add a fact in this Category!</h2>);

  return(
    <section>
      <ul className="facts-list">
          {
            facts.map((factObj)=><Fact key={factObj.id} fact={factObj} setFacts={setFacts}/>) //fact act like a parametere and there can be more than one. It is called props
          }
      </ul>
      <p>There are {facts.length} Facts in the Database. Add your own ! </p>
    </section>
  );
}

function Fact({fact, setFacts}){
  const [isUpdating, setIsUpdating] = useState(false);
  async function handleVote(columnName){
    setIsUpdating(true)
    const {data:updatedFact, error} = await supabase.from("facts")
    .update({[columnName]: fact[columnName] + 1})
    .eq("id", fact.id)
    .select();
    setIsUpdating(false)
    if(!error)
    setFacts((facts) => facts.map((f) => (f.id === fact.id ? updatedFact[0]:f)));

  }

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
                <button onClick={()=>handleVote("votesinteresting")} disabled={isUpdating}>👍 {fact.votesinteresting}</button>
                <button onClick={()=>handleVote("votesmindblowing")} disabled={isUpdating}>🤯 {fact.votesmindblowing}</button>
                <button onClick={()=>handleVote("votesfalse")} disabled={isUpdating}>⛔️ {fact.votesfalse}</button>
              </div>
            </li>
  );
}

export default App;
