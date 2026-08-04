import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import EditableText from '../components/EditableText';
import SortableItem from '../components/SortableItem';

export default function Minimalist({ data, onChange }) {
  if (!data) return null;

  const updateField = (path, value) => {
    onChange(path, value);
  };

  const handleDragEnd = (event, arrayName) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const items = data[arrayName];
      const oldIndex = items.findIndex(item => item.id === active.id || item.company === active.id || item.institution === active.id);
      const newIndex = items.findIndex(item => item.id === over.id || item.company === over.id || item.institution === over.id);
      const newArray = arrayMove(items, oldIndex, newIndex);
      updateField(arrayName, newArray);
    }
  };

  // Ensure items have unique IDs for dnd-kit
  const experienceItems = (data.experience || []).map((exp, i) => ({ ...exp, id: exp.id || exp.company || `exp-${i}` }));
  const educationItems = (data.education || []).map((edu, i) => ({ ...edu, id: edu.id || edu.institution || `edu-${i}` }));

  return (
    <div id="resume-document" className="resume-document minimalist">
      <div className="min-header">
        <EditableText as="h1" value={data.personal?.name} onChange={(v) => updateField('personal.name', v)} placeholder="Your Name" />
        <EditableText as="p" className="min-title" value={data.personal?.title} onChange={(v) => updateField('personal.title', v)} placeholder="Job Title" />
        <p className="min-contact">
          <EditableText value={data.personal?.email} onChange={(v) => updateField('personal.email', v)} placeholder="Email" /> | 
          {' '}<EditableText value={data.personal?.phone} onChange={(v) => updateField('personal.phone', v)} placeholder="Phone" /> | 
          {' '}<EditableText value={data.personal?.location} onChange={(v) => updateField('personal.location', v)} placeholder="Location" />
        </p>
      </div>

      {data.summary !== undefined && (
        <div className="min-section">
          <h2>Professional Summary</h2>
          <EditableText as="p" value={data.summary} onChange={(v) => updateField('summary', v)} placeholder="Summary..." />
        </div>
      )}

      {experienceItems.length > 0 && (
        <div className="min-section">
          <h2>Experience</h2>
          <DndContext collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'experience')}>
            <SortableContext items={experienceItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {experienceItems.map((exp, i) => (
                <SortableItem key={exp.id} id={exp.id}>
                  <div className="min-item">
                    <div className="min-item-header">
                      <strong><EditableText value={exp.role} onChange={(v) => updateField(`experience.${i}.role`, v)} placeholder="Role" /></strong>
                      <span>
                        <EditableText value={exp.startDate} onChange={(v) => updateField(`experience.${i}.startDate`, v)} placeholder="Start" /> - 
                        <EditableText value={exp.endDate} onChange={(v) => updateField(`experience.${i}.endDate`, v)} placeholder="End" />
                      </span>
                    </div>
                    <div className="min-company">
                      <EditableText value={exp.company} onChange={(v) => updateField(`experience.${i}.company`, v)} placeholder="Company" />
                    </div>
                    <ul>
                      {exp.description?.map((desc, j) => (
                        <li key={j}>
                          <EditableText value={desc} onChange={(v) => updateField(`experience.${i}.description.${j}`, v)} placeholder="Description" />
                        </li>
                      ))}
                    </ul>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {educationItems.length > 0 && (
        <div className="min-section">
          <h2>Education</h2>
          <DndContext collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'education')}>
            <SortableContext items={educationItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {educationItems.map((edu, i) => (
                <SortableItem key={edu.id} id={edu.id}>
                  <div className="min-item">
                    <div className="min-item-header">
                      <strong><EditableText value={edu.institution} onChange={(v) => updateField(`education.${i}.institution`, v)} placeholder="Institution" /></strong>
                      <span><EditableText value={edu.year} onChange={(v) => updateField(`education.${i}.year`, v)} placeholder="Year" /></span>
                    </div>
                    <div className="min-institution">
                      <EditableText value={edu.degree} onChange={(v) => updateField(`education.${i}.degree`, v)} placeholder="Degree" />
                    </div>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div className="min-section">
          <h2>Skills</h2>
          <p className="min-skills">
            {data.skills.map((skill, i) => (
              <React.Fragment key={i}>
                <EditableText value={skill} onChange={(v) => updateField(`skills.${i}`, v)} placeholder="Skill" />
                {i < data.skills.length - 1 ? ' • ' : ''}
              </React.Fragment>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
