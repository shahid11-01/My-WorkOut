import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from './components/ui/Button'; // Your provided Button component
import { Input } from './components/ui/Input';   // Your provided Input component
import { CustomDialog } from './components/ui/CustomDialog'; // The new Dialog component
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns'; // Requires: npm install date-fns
import { ko } from 'date-fns/locale'; // Requires: npm install date-fns

// --- Configuration ---
const BASE_URL = "http://localhost:8586"; // Your Backend URL

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};
// ----------------------------


// --- Data Structure Types ---
type Exercise = {
    id: number;
    exerciseName: string;
    sets: number;
    reps: number;
    text?: string; // CHANGED from memo to text
    completed: number; // Number of sets completed
    // Assuming backend returns a unique ID for the WorkoutExercise entity
    workoutExerciseId?: number; 
};

type Workout = {
    id: number;
    title: string; // e.g., "가슴 + 삼두"
    text?: string; // CHANGED from memo to text
    exercises: Exercise[];
    totalSets: number;
    completedSets: number;
    completionRate: number; // 0.0 to 1.0
};
// ----------------------------

// Initial/Placeholder Workout Data
const initialWorkouts: Workout[] = [];


export default function Schedule() {
    const [selectedDate, setSelectedDate] = useState(new Date(2025, 10, 23)); 
    const [scheduledWorkouts, setScheduledWorkouts] = useState<Workout[]>(initialWorkouts);
    const [isAddWorkoutModalOpen, setIsAddWorkoutModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    // --- State Logic ---
    const calculateWorkoutStatus = (exercises: Exercise[]): { totalSets: number, completedSets: number, completionRate: number } => {
        const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
        const completedSets = exercises.reduce((sum, ex) => sum + ex.completed, 0);
        const completionRate = totalSets > 0 ? completedSets / totalSets : 0;
        return { totalSets, completedSets, completionRate };
    };

    const updateWorkoutExercises = (workoutId: number, newExercises: Exercise[]) => {
        setScheduledWorkouts(prev => 
            prev.map(w => {
                if (w.id === workoutId) {
                    const status = calculateWorkoutStatus(newExercises);
                    return { ...w, exercises: newExercises, ...status };
                }
                return w;
            })
        );
    };

    // --- API Handlers (Integrated with Backend Paths) ---

    // 1. Fetch Workouts for the Selected Date (Currently using placeholder data)
    const fetchWorkouts = useCallback(async (date: Date) => {
        // You would typically call an API endpoint here to fetch workouts by date
        // Example: axios.get(`${BASE_URL}/api/workout/byDate?date=${format(date, 'yyyy-MM-dd')}`, { headers: getAuthHeaders() })
        
        // For now, stick to simple loading indicator
        setLoading(true);
        setError(null);
        try {
             // Simulating API latency
             await new Promise(resolve => setTimeout(resolve, 500));
             setScheduledWorkouts(initialWorkouts); // Use actual response data here
        } catch (e) {
            setError("운동 일정을 불러오는데 실패했습니다.");
            setScheduledWorkouts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkouts(selectedDate);
    }, [selectedDate, fetchWorkouts]);


    // 2. Create Workout (/api/workout/create)
    const handleAddWorkout = async (title: string, text: string) => { // CHANGED memo to text
        try {
            const dateString = format(selectedDate, 'yyyy-MM-dd');

            const response = await axios.post(`${BASE_URL}/api/workout/create`, {
                title,
                text, // CHANGED memo to text in payload
                scheduledDate: dateString, // Pass the selected date to the backend
            }, { headers: getAuthHeaders() });

            // Assuming the response body contains the newly created WorkoutDto with ID
            const createdWorkoutDto = response.data; 

            // Add the new workout (and its ID) to the local state
            const newWorkout: Workout = {
                id: createdWorkoutDto.workoutId, 
                title,
                text, // CHANGED memo to text
                exercises: [],
                totalSets: 0,
                completedSets: 0,
                completionRate: 0,
            };
            setScheduledWorkouts(prev => [...prev, newWorkout]);
            setIsAddWorkoutModalOpen(false);

        } catch (e: any) {
            console.error("Failed to create workout:", e);
            setError("운동 일정 생성에 실패했습니다. 인증/서버 연결을 확인하세요.");
        }
    };
    
    // 3. Delete Workout (/api/workout/workouts/{id})
    const handleRemoveWorkout = async (id: number) => {
        if (!window.confirm("정말로 이 운동 일정을 삭제하시겠습니까?")) return;
        
        try {
            await axios.delete(`${BASE_URL}/api/workout/workouts/${id}`, { headers: getAuthHeaders() });
            setScheduledWorkouts(prev => prev.filter(w => w.id !== id));

        } catch (e: any) {
            console.error("Failed to delete workout:", e);
            setError("운동 일정 삭제에 실패했습니다.");
        }
    };

    // 4. Toggle Set Completion (Partial Update, currently simulated)
    const handleToggleSetCompletion = (workoutId: number, exerciseId: number, isComplete: boolean) => {
        const workoutToUpdate = scheduledWorkouts.find(w => w.id === workoutId);
        if (!workoutToUpdate) return;
    
        const newExercises = workoutToUpdate.exercises.map(ex => {
            if (ex.id === exerciseId) {
                // If you were toggling completion status in the backend, you'd call a PATCH endpoint here.
                // For now, we update local state:
                let newCompleted = ex.completed;
                if (isComplete) {
                    newCompleted = Math.min(ex.sets, ex.completed + 1);
                } else {
                    newCompleted = Math.max(0, ex.completed - 1);
                }
                return { ...ex, completed: newCompleted };
            }
            return ex;
        });

        updateWorkoutExercises(workoutId, newExercises);
        
        // If you were using the PATCH endpoint:
        // const exerciseToToggle = workoutToUpdate.exercises.find(ex => ex.id === exerciseId);
        // if (exerciseToToggle && exerciseToToggle.workoutExerciseId) {
        //     axios.patch(`${BASE_URL}/api/workoutExercise/${exerciseToToggle.workoutExerciseId}/toggle`, {}, { headers: getAuthHeaders() });
        // }
    };

    // --- Date Navigation & Render Logic ---
    const handlePrevDay = () => setSelectedDate(prev => new Date(prev.getTime() - 86400000));
    const handleNextDay = () => setSelectedDate(prev => new Date(prev.getTime() + 86400000));
    const handleDateSelect = (date: Date) => setSelectedDate(date); // Placeholder for a real calendar picker

    const formattedDate = format(selectedDate, 'yyyy년 M월 d일', { locale: ko });
    const hasWorkouts = scheduledWorkouts.length > 0;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">운동 일정</h1>
            <p className="text-sm text-gray-500">날짜별 운동 일정을 등록하고 관리하세요</p>
            
            {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">{error}</div>
            )}

            {/* 1. Date Navigation Bar */}
            <div className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={handlePrevDay}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div 
                        className="flex items-center border border-gray-300 rounded-lg p-2 gap-2 cursor-pointer transition-colors hover:bg-gray-50" 
                        onClick={() => handleDateSelect(new Date())}
                    >
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{formattedDate}</span>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleNextDay}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                <Button 
                    onClick={() => setIsAddWorkoutModalOpen(true)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-md hover:shadow-lg transition-shadow"
                    disabled={loading}
                >
                    <Plus className="w-5 h-5" />
                    운동 일정 추가
                </Button>
            </div>

            {/* 2. Workout Display Area */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center p-16 bg-white rounded-xl shadow-lg">
                        <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
                        <span className="text-gray-600">운동 일정을 불러오는 중...</span>
                    </div>
                ) : hasWorkouts ? (
                    scheduledWorkouts.map(workout => (
                        <WorkoutItem 
                            key={workout.id} 
                            workout={workout} 
                            onRemove={handleRemoveWorkout} 
                            onUpdateExercises={updateWorkoutExercises}
                            onToggleSetCompletion={handleToggleSetCompletion}
                            selectedDate={selectedDate}
                        />
                    ))
                ) : (
                    <EmptyScheduleState onAddWorkout={() => setIsAddWorkoutModalOpen(true)} />
                )}
            </div>

            {/* 3. Modals */}
            <WorkoutAddModal 
                isOpen={isAddWorkoutModalOpen} 
                onClose={() => setIsAddWorkoutModalOpen(false)}
                onSave={handleAddWorkout}
                selectedDate={selectedDate}
            />
        </div>
    );
}

// --- Helper Components ---

// Empty State Component
const EmptyScheduleState = ({ onAddWorkout }: { onAddWorkout: () => void }) => (
    <div className="flex flex-col items-center justify-center p-16 bg-white border border-dashed rounded-xl text-gray-500 space-y-4 shadow-inner">
        <CalendarIcon className="w-12 h-12 text-gray-300" />
        <p>이 날짜에 등록된 운동이 없습니다.</p>
        <p>운동 일정을 추가해보세요!</p>
        <Button onClick={onAddWorkout} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 mt-4">
            <Plus className="w-5 h-5" />
            운동 일정 추가
        </Button>
    </div>
);

// Individual Workout Item Display Component
interface WorkoutItemProps {
    workout: Workout; 
    onRemove: (id: number) => void;
    onUpdateExercises: (workoutId: number, exercises: Exercise[]) => void;
    onToggleSetCompletion: (workoutId: number, exerciseId: number, isComplete: boolean) => void;
    selectedDate: Date;
}

const WorkoutItem = ({ workout, onRemove, onUpdateExercises, onToggleSetCompletion, selectedDate }: WorkoutItemProps) => {
    const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
    
    // 4. Add Exercise (/api/workoutExercise/add)
    const handleAddExercise = async (exercise: Omit<Exercise, 'id' | 'completed' | 'workoutExerciseId'>) => {
        console.log("WOrkoutID:", workout.id);
        try {
            const response = await axios.post(`${BASE_URL}/api/workoutExercise/add`, {
                // Backend DTO structure: workoutId, exerciseName, sets, reps, text
                workoutId: workout.id, 
                ...exercise
            }, { headers: getAuthHeaders() });

            const addedExerciseDto = response.data; // Assuming backend returns the Exercise DTO

            const newExercise: Exercise = {
                ...exercise,
                id: Date.now(), // Fallback ID for local state
                completed: 0,
                workoutExerciseId: addedExerciseDto.workoutExerciseId, // Use the real backend ID
            };
            
            const newExercises = [...workout.exercises, newExercise];
            onUpdateExercises(workout.id, newExercises);
            setIsAddExerciseModalOpen(false);
        } catch (e: any) {
            console.error("Failed to add exercise:", e);
            alert("운동 추가에 실패했습니다. 서버 연결을 확인하세요.");
        }
    };
    
    const handleRemoveExercise = (exerciseId: number) => {
        // Since the backend doesn't have a direct delete endpoint for WorkoutExercise in your controllers, 
        // we simulate deletion by updating the workout exercises. 
        // If a delete endpoint is added later (e.g., /api/workoutExercise/{id}), it should be called here.
        const newExercises = workout.exercises.filter(ex => ex.id !== exerciseId);
        onUpdateExercises(workout.id, newExercises);
    };

    return (
        <div className="p-5 bg-white border rounded-xl shadow-lg space-y-4">
            <div className="flex justify-between items-start">
                {/* Workout Title and Text */}
                <div className="flex items-center space-x-3">
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" checked={workout.completionRate === 1} readOnly />
                    <div>
                        <p className="font-bold text-xl text-gray-800">{workout.title}</p>
                        {workout.text && <p className="text-sm text-gray-600 mt-1 italic">{workout.text}</p>}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setIsAddExerciseModalOpen(true)} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700">
                        <Plus className="w-4 h-4" /> 운동 추가
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onRemove(workout.id)} className="text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Status Bar */}
            <div className="text-sm text-gray-500 border-t pt-3">
                총 세트: {workout.completedSets}/{workout.totalSets} 완료 | 완료율: <span className="font-semibold text-blue-600">{Math.round(workout.completionRate * 100)}%</span>
            </div>
            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className="h-2 bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.round(workout.completionRate * 100)}%` }}
                ></div>
            </div>

            {/* Exercise List Area */}
            <div className="mt-4 space-y-3">
                {workout.exercises.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 border-t border-dashed">
                        아직 추가된 운동이 없습니다.
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsAddExerciseModalOpen(true)} 
                            className="text-blue-600 text-sm p-0 ml-1 h-auto" 
                        >
                            + 운동 추가
                        </Button>
                    </div>
                ) : (
                    workout.exercises.map(exercise => (
                        <ExerciseRow 
                            key={exercise.id} 
                            exercise={exercise} 
                            workoutId={workout.id}
                            onToggleSetCompletion={onToggleSetCompletion}
                            onRemove={handleRemoveExercise}
                        />
                    ))
                )}
            </div>

            {/* Exercise Add Modal (Modal 2) */}
            <ExerciseAddModal
                isOpen={isAddExerciseModalOpen}
                onClose={() => setIsAddExerciseModalOpen(false)}
                onSave={handleAddExercise}
            />
        </div>
    );
};

// --- Component for a Single Exercise Row ---
interface ExerciseRowProps {
    exercise: Exercise;
    workoutId: number;
    onToggleSetCompletion: (workoutId: number, exerciseId: number, isComplete: boolean) => void;
    onRemove: (exerciseId: number) => void;
}

const ExerciseRow = ({ exercise, workoutId, onToggleSetCompletion, onRemove }: ExerciseRowProps) => {
    const setsArray = Array.from({ length: exercise.sets }, (_, i) => i + 1);
    const isCompleted = exercise.completed === exercise.sets;

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors">
            {/* Left: Exercise Details */}
            <div className="flex-1 min-w-0 pr-4">
                <p className={`font-medium ${isCompleted ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                    {exercise.exerciseName}
                </p>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                    {exercise.sets} 세트 x {exercise.reps} 횟수 {exercise.text && `(${exercise.text})`}
                </p>
            </div>

            {/* Right: Set Completion and Remove */}
            <div className="flex items-center space-x-3">
                {/* Set Trackers */}
                <div className="flex gap-1">
                    {setsArray.map((setNumber) => (
                        <div
                            key={setNumber}
                            className={`w-6 h-6 flex items-center justify-center rounded-full border cursor-pointer transition-all duration-200 text-xs font-semibold`}
                            onClick={() => onToggleSetCompletion(workoutId, exercise.id, setNumber > exercise.completed)}
                        >
                            {setNumber <= exercise.completed ? (
                                <CheckCircle className="w-5 h-5 text-green-500 fill-green-500/10" />
                            ) : (
                                <span className="text-gray-400 border-gray-300 w-5 h-5 rounded-full border flex items-center justify-center">
                                    {setNumber}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Remove Button */}
                <Button variant="ghost" size="icon" onClick={() => onRemove(exercise.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};


// --- Modal Component 1: Workout Add (For title and text) ---
const WorkoutAddModal = ({ isOpen, onClose, onSave, selectedDate }: { isOpen: boolean, onClose: () => void, onSave: (title: string, text: string) => Promise<void>, selectedDate: Date }) => { // CHANGED memo to text
    const [title, setTitle] = useState('');
    const [text, setText] = useState(''); // CHANGED memo to text
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (title.trim()) {
            setIsSaving(true);
            try {
                await onSave(title, text); // CHANGED memo to text
                setTitle('');
                setText(''); // CHANGED memo to text
            } catch (error) {
                // Error handled in parent component
            } finally {
                setIsSaving(false);
            }
        }
    };

    const dialogDescription = `${format(selectedDate, 'yyyy. M. d.', { locale: ko })}에 운동 일정을 추가합니다`;

    return (
        <CustomDialog 
            isOpen={isOpen} 
            onClose={!isSaving ? onClose : () => {}} // Prevent closing while saving
            title="운동 일정 추가"
            description={dialogDescription}
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                
                <div className="space-y-1">
                    <label htmlFor="title-input" className="block text-sm font-medium">일정 제목 *</label>
                    <Input
                        id="title-input"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="가슴 + 삼두"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="text-textarea" className="block text-sm font-medium">메모 (선택)</label>
                    <textarea
                        id="text-textarea" // CHANGED memo to text
                        value={text} // CHANGED memo to text
                        onChange={(e) => setText(e.target.value)} // CHANGED memo to text
                        placeholder="ㅋㅋㅋㅋㅋ"
                        rows={3}
                        className="w-full p-2 border border-input rounded-lg resize-none text-sm bg-input-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                    />
                </div>
            </form>

            <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose} disabled={isSaving}>
                    취소
                </Button>
                <Button onClick={handleSubmit} variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!title.trim() || isSaving}>
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        '추가'
                    )}
                </Button>
            </div>
        </CustomDialog>
    );
};


// --- Modal Component 2: Exercise Add (For sets, reps, text) ---
const ExerciseAddModal = ({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (exercise: Omit<Exercise, 'id' | 'completed' | 'workoutExerciseId'>) => Promise<void> }) => {
    // These should come from your backend /api/exercises list
    const predefinedExercises = ["벤치프레스", "스쿼트", "데드리프트", "숄더프레스", "바벨 로우", "바이셉 컬", "트라이셉 익스텐션", "레그 프레스"];
    const [selectedExercise, setSelectedExercise] = useState('');
    const [sets, setSets] = useState(3);
    const [reps, setReps] = useState(10);
    const [text, setText] = useState(''); // CHANGED memo to text
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (selectedExercise) {
            setIsSaving(true);
            try {
                await onSave({
                    exerciseName: selectedExercise,
                    sets: Number(sets),
                    reps: Number(reps),
                    text // CHANGED memo to text in payload
                });
                // Reset form on successful save
                setSelectedExercise('');
                setSets(3);
                setReps(10);
                setText(''); // CHANGED memo to text
            } catch (error) {
                // Error handled in parent component
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <CustomDialog 
            isOpen={isOpen} 
            onClose={!isSaving ? onClose : () => {}} // Prevent closing while saving
            title="운동 추가"
            description="일정에 추가할 운동을 선택하세요"
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                
                <div className="space-y-1">
                    <label htmlFor="exercise-select" className="block text-sm font-medium">운동 선택 *</label>
                    <div className="relative">
                        <select 
                            id="exercise-select"
                            value={selectedExercise}
                            onChange={(e) => setSelectedExercise(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm appearance-none pr-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            disabled={isSaving}
                        >
                            <option value="" disabled>운동 선택</option>
                            {predefinedExercises.map(ex => (
                                <option key={ex} value={ex}>{ex}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500" /> 
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label htmlFor="sets-input" className="block text-sm font-medium">세트 *</label>
                        <Input
                            id="sets-input"
                            type="number"
                            value={sets}
                            onChange={(e) => setSets(Number(e.target.value))}
                            min="1"
                            disabled={isSaving}
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="reps-input" className="block text-sm font-medium">횟수 *</label>
                        <Input
                            id="reps-input"
                            type="number"
                            value={reps}
                            onChange={(e) => setReps(Number(e.target.value))}
                            min="1"
                            disabled={isSaving}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label htmlFor="text-textarea-ex" className="block text-sm font-medium">메모 (선택)</label>
                    <textarea
                        id="text-textarea-ex" // CHANGED memo to text
                        value={text} // CHANGED memo to text
                        onChange={(e) => setText(e.target.value)} // CHANGED memo to text
                        placeholder="60kg"
                        rows={3}
                        className="w-full p-2 border border-input rounded-lg resize-none text-sm bg-input-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        disabled={isSaving}
                    />
                </div>
            </form>

            <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose} disabled={isSaving}>
                    취소
                </Button>
                <Button onClick={handleSubmit} variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!selectedExercise || isSaving}>
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        '추가'
                    )}
                </Button>
            </div>
        </CustomDialog>
    );
};