import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { NewProjectModal } from '../components/modals/NewProjectModal';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Projects() {
  const { t } = useTranslation();
  const projects = useStore((state) => state.projects);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">{t('projects.title')}</h1>
          <p className="text-on-surface-variant mt-1">{projects.length} {t('projects.title').toLowerCase()}</p>
        </div>
        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Novo Projeto
        </button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {projects.map((project) => (
          <motion.div key={project.id} variants={item}>
            <Link to={`/projects/${project.id}`} className="bg-surface-container-low border border-surface-container-high rounded-2xl p-5 hover:border-primary/50 transition-colors cursor-pointer flex flex-col gap-4 group">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-lg font-bold text-on-surface group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant text-[10px] font-bold tracking-wider uppercase">
                  {project.stage}
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${project.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500' : project.status === 'Concluído' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'}`}>
                  {project.status}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-headline font-semibold text-on-surface text-lg">{project.name}</h3>
              <p className="text-sm text-on-surface-variant mt-1">Projeto Interno</p>
            </div>
            
            <div className="mt-auto pt-4 flex items-center justify-between">
              <p className="text-xs text-on-surface-variant">Prazo: {project.dueDate}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary">{project.progress}%</span>
                <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            </div>
          </Link>
          </motion.div>
        ))}
        {projects.length === 0 && (
          <motion.div variants={item} className="col-span-full bg-surface-container-low rounded-2xl p-8 text-center border border-surface-container-high">
            <p className="text-on-surface-variant">{t('projects.noProjects')}</p>
          </motion.div>
        )}
      </motion.div>

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
}
