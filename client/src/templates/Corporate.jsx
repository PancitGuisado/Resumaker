import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import EditableText from '../components/EditableText';
import SortableItem from '../components/SortableItem';
import '../styles/templates.css';

export default function Corporate({ data, onChange }) {
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

  const experienceItems = (data.experience || []).map((exp, i) => ({ ...exp, id: exp.id || exp.company || `exp-${i}` }));
  const educationItems = (data.education || []).map((edu, i) => ({ ...edu, id: edu.id || edu.institution || `edu-${i}` }));

  return (
    <div id="resume-document" className="resume-document corporate">
      <div className="corp-header">
        <EditableText as="h1" value={data.personal?.name} onChange={(v) => updateField('personal.name', v)} placeholder="Your Name" />
        <p className="corp-contact">
          <EditableText value={data.personal?.email} onChange={(v) => updateField('personal.email', v)} placeholder="Email" />  |  
          {' '}<EditableText value={data.personal?.phone} onChange={(v) => updateField('personal.phone', v)} placeholder="Phone" />  |  
          {' '}<EditableText value={data.personal?.location} onChange={(v) => updateField('personal.location', v)} placeholder="Location" />
        </p>
      </div>

      <div className="corp-content">
        {data.summary !== undefined && (
          <div className="corp-section">
            <h2 className="corp-section-title">Professional Summary</h2>
            <EditableText as="p" className="corp-text" value={data.summary} onChange={(v) => updateField('summary', v)} placeholder="Summary..." />
          </div>
        )}

        {experienceItems.length > 0 && (
          <div className="corp-section">
            <h2 className="corp-section-title">Professional Experience</h2>
            <div className="corp-items">
              <DndContext collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'experience')}>
                <SortableContext items={experienceItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  {experienceItems.map((exp, i) => (
                    <SortableItem key={exp.id} id={exp.id}>
                      <div className="corp-item">
                        <div className="corp-item-header">
                          <span className="corp-company"><EditableText value={exp.company} onChange={(v) => updateField(`experience.${i}.company`, v)} placeholder="Company" /></span>
                          <span className="corp-dates">
                            <EditableText value={exp.startDate} onChange={(v) => updateField(`experience.${i}.startDate`, v)} placeholder="Start" /> - 
                            <EditableText value={exp.endDate} onChange={(v) => updateField(`experience.${i}.endDate`, v)} placeholder="End" />
                          </span>
                        </div>
                        <div className="corp-role"><EditableText value={exp.role} onChange={(v) => updateField(`experience.${i}.role`, v)} placeholder="Role" /></div>
                        <ul className="corp-list">
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
          </div>
        )}

        {educationItems.length > 0 && (
          <div className="corp-section">
            <h2 className="corp-section-title">Education</h2>
            <div className="corp-items">
              <DndContext collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'education')}>
                <SortableContext items={educationItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  {educationItems.map((edu, i) => (
                    <SortableItem key={edu.id} id={edu.id}>
                      <div className="corp-item">
                        <div className="corp-item-header">
                          <span className="corp-company"><EditableText value={edu.institution} onChange={(v) => updateField(`education.${i}.institution`, v)} placeholder="Institution" /></span>
                          <span className="corp-dates"><EditableText value={edu.year} onChange={(v) => updateField(`education.${i}.year`, v)} placeholder="Year" /></span>
                        </div>
                        <div className="corp-role"><EditableText value={edu.degree} onChange={(v) => updateField(`education.${i}.degree`, v)} placeholder="Degree" /></div>
                      </div>
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}

        {data.skills && data.skills.length > 0 && (
          <div className="corp-section">
            <h2 className="corp-section-title">Technical Skills</h2>
            <p className="corp-text">
              <strong>Core Competencies: </strong> 
              {data.skills.map((skill, i) => (
                <React.Fragment key={i}>
                  <EditableText value={skill} onChange={(v) => updateField(`skills.${i}`, v)} placeholder="Skill" />
                  {i < data.skills.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
