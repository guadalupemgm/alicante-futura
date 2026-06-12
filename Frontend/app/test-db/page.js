import db from '../../lib/db';

export default function TestPage() {
  // Consultamos los programas de lealtad
  const programas = db.prepare('SELECT * FROM loyalty_program').all();
  
  return (
    <div>
      <h1>Mis programas de lealtad:</h1>
      <pre>{JSON.stringify(programas, null, 2)}</pre>
    </div>
  );
}