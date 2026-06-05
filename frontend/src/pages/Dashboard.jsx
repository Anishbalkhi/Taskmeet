import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { getUserTasks } from '../api/taskApi';
import { MessageCircle, Plus, LayoutGrid, Users, CheckCircle, Clock, ArrowRight, TrendingUp } from 'lucide-react';

const ROLE_BADGE = {
  owner: { label: '👑 Owner', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  admin: { label: '👑 Admin', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  manager: { label: '🛡 Manager', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  member: { label: '👤 Member', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const Dashboard = () => {
  const { logout, user } = useAuth();
  const { workspaces, setCurrentWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const [taskStats, setTaskStats] = useState({ completed: 0, pending: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const res = await getUserTasks();
        const allTasks = res.data.data || [];
        const completed = allTasks.filter(t => t.status === 'Completed').length;
        const pending = allTasks.filter(t => t.status !== 'Completed').length;
        setTaskStats({ completed, pending });
      } catch {
        // fail silently — don't crash dashboard
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const stats = [
    {
      icon: <CheckCircle className="w-7 h-7" />,
      label: "Tasks Completed",
      value: statsLoading ? '—' : taskStats.completed,
      gradient: "from-green-500 to-teal-500",
      bg: "card-green-bg"
    },
    {
      icon: <Clock className="w-7 h-7" />,
      label: "Pending Tasks",
      value: statsLoading ? '—' : taskStats.pending,
      gradient: "from-orange-500 to-yellow-500",
      bg: "card-yellow-bg"
    },
    {
      icon: <LayoutGrid className="w-7 h-7" />,
      label: "Workspaces",
      value: workspaces?.length ?? 0,
      gradient: "from-purple-500 to-pink-500",
      bg: "card-purple-bg"
    },
  ];

  return (
    <div className="min-h-screen">

      <nav className="bg-white/90 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">MeetTask</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium hidden md:block">
              Welcome back, <strong>{user?.name || 'there'}</strong>!
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-5 py-2 rounded-xl hover:bg-red-600 font-semibold transition-all shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 sm:mb-3">
            Your Dashboard
          </h1>
          <p className="text-gray-600 text-base sm:text-xl">
            Manage your tasks and workspaces all in one place.
          </p>
        </div>

        {/* Live stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className={`${stat.bg} rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                <span className="text-4xl font-bold text-gray-900">{stat.value}</span>
              </div>
              <p className="text-gray-800 font-semibold text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Create workspace CTA */}
        <div className="mb-8 sm:mb-12">
          <motion.div
            className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 border border-gray-100 relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate('/dashboard/create-workspace')}
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg flex-shrink-0">
                <LayoutGrid className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Create Workspace</h3>
            </div>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              Organize your team and projects in dedicated workspaces.
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 group-hover:gap-3 text-sm sm:text-base">
              New Workspace
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </motion.div>
        </div>

        {/* Workspaces list */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900">Your Workspaces</h2>
            <button
              onClick={() => navigate('/dashboard/create-workspace')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Create Workspace</span>
              <span className="xs:hidden">New</span>
            </button>
          </div>

          {workspaces && workspaces.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace, index) => {
                const badge = ROLE_BADGE[workspace.role] || ROLE_BADGE.member;
                return (
                  <motion.div
                    key={workspace.id}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl shadow-md">
                        <LayoutGrid className="w-6 h-6 text-white" />
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {workspace.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {workspace.description || 'No description provided'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{workspace.memberCount || 1} member{workspace.memberCount !== 1 ? 's' : ''}</span>
                      </div>
                      <button
                        onClick={() => { setCurrentWorkspace(workspace); navigate('/dashboard/team'); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                      >
                        Open <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-purple-100 rounded-full">
                  <LayoutGrid className="w-16 h-16 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No workspaces yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Create your first workspace to start organizing tasks and collaborating with your team.
              </p>
              <button
                onClick={() => navigate('/dashboard/create-workspace')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Your First Workspace
              </button>
            </motion.div>
          )}
        </div>

        {/* Recent tasks summary */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Stats</h2>
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 border border-gray-100">
            {statsLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-purple-600" />
              </div>
            ) : (taskStats.completed + taskStats.pending) === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No tasks assigned to you yet</p>
                <p className="text-sm mt-1">Join a workspace and start creating tasks to see stats here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Tasks', value: taskStats.completed + taskStats.pending, color: 'text-gray-900' },
                  { label: 'Completed', value: taskStats.completed, color: 'text-green-600' },
                  { label: 'Pending', value: taskStats.pending, color: 'text-orange-600' },
                  {
                    label: 'Completion Rate',
                    value: `${taskStats.completed + taskStats.pending > 0
                      ? Math.round((taskStats.completed / (taskStats.completed + taskStats.pending)) * 100)
                      : 0}%`,
                    color: 'text-purple-600'
                  },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
