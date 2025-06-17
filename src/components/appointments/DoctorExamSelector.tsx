
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Stethoscope } from 'lucide-react';
import { useAppointmentLogic } from '@/hooks/useAppointmentLogic';

interface DoctorExamSelectorProps {
  selectedDoctor: string;
  selectedExamType: string;
  onDoctorChange: (doctorId: string) => void;
  onExamTypeChange: (examTypeId: string) => void;
}

const DoctorExamSelector: React.FC<DoctorExamSelectorProps> = ({
  selectedDoctor,
  selectedExamType,
  onDoctorChange,
  onExamTypeChange
}) => {
  const {
    filteredDoctors,
    filteredExamTypes,
    handleDoctorChange,
    handleExamTypeChange
  } = useAppointmentLogic();

  const onDoctorSelect = (doctorId: string) => {
    handleDoctorChange(doctorId);
    onDoctorChange(doctorId);
  };

  const onExamSelect = (examTypeId: string) => {
    handleExamTypeChange(examTypeId);
    onExamTypeChange(examTypeId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Doctor Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <User className="h-4 w-4" />
          Médico
        </label>
        <Select value={selectedDoctor} onValueChange={onDoctorSelect}>
          <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            <SelectValue placeholder="Selecione o médico" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            {filteredDoctors.map((doctor) => (
              <SelectItem 
                key={doctor.id} 
                value={doctor.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{doctor.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {doctor.specialty || 'Clínica Geral'}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exam Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Stethoscope className="h-4 w-4" />
          Tipo de Exame
        </label>
        <Select 
          value={selectedExamType} 
          onValueChange={onExamSelect}
          disabled={!selectedDoctor}
        >
          <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            <SelectValue placeholder="Selecione o tipo de exame" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            {filteredExamTypes.map((examType) => (
              <SelectItem 
                key={examType.id} 
                value={examType.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{examType.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {examType.duration_minutes} min - {examType.category}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedDoctor && filteredExamTypes.length === 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Nenhum exame disponível para esta especialidade médica.
          </p>
        )}
      </div>
    </div>
  );
};

export default DoctorExamSelector;
