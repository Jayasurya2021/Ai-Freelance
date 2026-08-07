import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, MapPin, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const statuses = [
  { id: 'new', label: 'New', color: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
  { id: 'saved', label: 'Saved', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'applied', label: 'Applied', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'interviewing', label: 'Interviewing', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'offer', label: 'Offer', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' }
];

const JobCard = ({ job, onMove }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 hover:shadow-md transition-all group flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-zinc-900 leading-tight line-clamp-2">{job.title}</h4>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center text-xs text-zinc-500 gap-1.5">
          <Building2 size={14} className="shrink-0" />
          <span className="truncate">{job.company}</span>
        </div>
        <div className="flex items-center text-xs text-zinc-500 gap-1.5">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center text-xs text-zinc-500 gap-1.5">
          <DollarSign size={14} className="shrink-0" />
          <span className="truncate">{job.salary}</span>
        </div>
      </div>
      
      <div className="mt-2 flex gap-1 overflow-x-auto pb-1 no-scrollbar">
        {statuses.filter(s => s.id !== job.status).map(status => (
            <button
              key={status.id}
              onClick={() => onMove(job._id, status.id)}
              className="text-[10px] font-bold px-2 py-1 bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors whitespace-nowrap text-zinc-600 border border-zinc-200 hover:border-indigo-200"
            >
              To {status.label}
            </button>
        ))}
      </div>
    </div>
  );
};

const JobTracker = () => {
  const queryClient = useQueryClient();
  const [draggedJob, setDraggedJob] = useState(null);

  const { data: jobsResponse, isLoading } = useQuery({
    queryKey: ['jobs_kanban'],
    queryFn: async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs?limit=500`);
      return data;
    }
  });

  // Also include hidden jobs if any were explicitly put into tracker statuses,
  // but usually getJobs filters out hidden. That's fine for now.
  const jobs = jobsResponse?.jobs || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }) => {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}/status`, { status });
    },
    onMutate: async ({ jobId, status }) => {
      await queryClient.cancelQueries(['jobs_kanban']);
      const previousJobs = queryClient.getQueryData(['jobs_kanban']);
      
      queryClient.setQueryData(['jobs_kanban'], (old) => {
        if (!old) return old;
        return {
          ...old,
          jobs: old.jobs.map(j => j._id === jobId ? { ...j, status } : j)
        };
      });
      return { previousJobs };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['jobs_kanban'], context.previousJobs);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['jobs_kanban']);
    }
  });

  const handleMove = (jobId, newStatus) => {
    updateStatusMutation.mutate({ jobId, status: newStatus });
  };

  const handleDragStart = (e, job) => {
    setDraggedJob(job);
    e.dataTransfer.setData('jobId', job._id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, statusId) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    if (jobId && draggedJob && draggedJob.status !== statusId) {
      handleMove(jobId, statusId);
    }
    setDraggedJob(null);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-500 font-bold">Loading Job Tracker...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">Job Tracker</h1>
          <p className="text-zinc-500 mt-2 text-sm md:text-base">
            Track your job applications. Drag and drop jobs to update their status.
          </p>
        </div>
        <Link to="/feed" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition">
          Find New Jobs
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-8 min-h-[70vh] items-start">
        {statuses.map(status => {
          const columnJobs = jobs.filter(j => j.status === status.id);
          
          return (
            <div 
              key={status.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status.id)}
              className="bg-zinc-50/80 rounded-2xl p-4 min-w-[300px] w-[300px] flex flex-col gap-4 border border-zinc-200 shrink-0 h-full"
            >
              <div className="flex justify-between items-center px-1">
                <h3 className={`text-sm font-bold px-3 py-1 rounded-full border ${status.color}`}>
                  {status.label}
                </h3>
                <span className="text-xs font-bold text-zinc-400 bg-white px-2 py-1 rounded-lg border border-zinc-200">
                  {columnJobs.length}
                </span>
              </div>
              
              <div className="flex flex-col gap-3 min-h-[150px]">
                {columnJobs.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-6 text-center text-zinc-400 text-sm border-2 border-dashed border-zinc-200 rounded-xl">
                    No jobs here
                  </div>
                ) : (
                  columnJobs.map((job) => (
                    <div 
                        key={job._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, job)}
                        className="cursor-grab active:cursor-grabbing"
                    >
                        <JobCard job={job} onMove={handleMove} />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobTracker;
