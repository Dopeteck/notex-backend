// src/pages/GpaCalculator.jsx
import React, { useState } from 'react';

export default function GpaCalculator({ API_URL, sessionToken, onBack }) {
  const [courses, setCourses] = useState([{ title:'', unit:'3', grade:'' }]);
  const [gpa, setGpa] = useState(null);
  const [saving, setSaving] = useState(false);

  const gradePoints = { A:5, B:4, C:3, D:2, E:1, F:0 };

  const change = (i, field, value) => {
    const copy = [...courses]; copy[i][field] = value; setCourses(copy);
  };
  const add = () => setCourses([...courses, { title:'', unit:'3', grade:'' }]);
  const calcLocal = () => {
    let totalUnits = 0, totalPoints = 0;
    courses.forEach(c => {
      const u = Number(c.unit) || 0;
      const gp = gradePoints[(c.grade||'').toUpperCase()] ?? 0;
      totalUnits += u;
      totalPoints += u * gp;
    });
    setGpa(totalUnits ? +(totalPoints / totalUnits).toFixed(2) : 0.00);
  };

  const save = async () => {
    calcLocal();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/tools/gpa/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
        body: JSON.stringify({ courses })
      });
      const data = await res.json();
      if (data.success) {
        setGpa(data.gpa);
        alert('GPA saved.');
      } else alert(data.error || 'Save failed');
    } catch (err) {
      console.error(err); alert('Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <button onClick={onBack} className="mb-4 text-sm">← Back</button>
      <h1 className="text-xl font-bold mb-3">GPA Calculator</h1>
      {courses.map((c,i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={c.title} onChange={e=>change(i,'title',e.target.value)} placeholder="Course" className="flex-1 border rounded px-2" />
          <input value={c.unit} onChange={e=>change(i,'unit',e.target.value)} placeholder="Units" className="w-20 border rounded px-2" />
          <input value={c.grade} onChange={e=>change(i,'grade',e.target.value)} placeholder="Grade (A-F)" className="w-20 border rounded px-2" />
        </div>
      ))}
      <div className="flex gap-2">
        <button onClick={add} className="px-3 py-2 bg-gray-200 rounded">+ Add</button>
        <button onClick={calcLocal} className="px-3 py-2 bg-blue-600 text-white rounded">Calculate</button>
        <button onClick={save} className="px-3 py-2 bg-green-600 text-white rounded" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>

      {gpa !== null && <div className="mt-4">GPA: <span className="font-bold">{gpa}</span></div>}
    </div>
  );
}
