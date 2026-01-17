import { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Database } from '@phosphor-icons/react'

interface Student {
  id: number
  firstName: string
  lastName: string
  email: string
  major: string
  enrollmentDate: string
}

export function StudentDatabasePreview() {
  const [students] = useState<Student[]>([
    {
      id: 1,
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@email.com',
      major: 'Computer Science',
      enrollmentDate: '2023-09-01'
    },
    {
      id: 2,
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@email.com',
      major: 'Mathematics',
      enrollmentDate: '2023-09-01'
    },
    {
      id: 3,
      firstName: 'Carol',
      lastName: 'Davis',
      email: 'carol@email.com',
      major: 'Physics',
      enrollmentDate: '2023-09-01'
    },
    {
      id: 4,
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david@email.com',
      major: 'Computer Science',
      enrollmentDate: '2023-09-02'
    },
    {
      id: 5,
      firstName: 'Emma',
      lastName: 'Brown',
      email: 'emma@email.com',
      major: 'Biology',
      enrollmentDate: '2023-09-02'
    }
  ])

  const getMajorColor = (major: string) => {
    const colors: Record<string, string> = {
      'Computer Science': 'bg-primary/10 text-primary',
      'Mathematics': 'bg-accent/10 text-accent',
      'Physics': 'bg-secondary/30 text-secondary-foreground',
      'Biology': 'bg-green-500/10 text-green-700'
    }
    return colors[major] || 'bg-muted'
  }

  return (
    <div className="min-h-[400px] bg-gradient-to-br from-primary/5 to-secondary/10 rounded-lg p-6">
      <Card className="overflow-hidden">
        <div className="bg-primary/10 px-6 py-4 border-b flex items-center gap-3">
          <Database size={24} className="text-primary" weight="duotone" />
          <div>
            <h3 className="text-lg font-bold">Student Database</h3>
            <p className="text-sm text-muted-foreground">
              {students.length} students enrolled
            </p>
          </div>
        </div>
        
        <div className="overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Major</TableHead>
                <TableHead>Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono font-semibold">
                    {student.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.email}
                  </TableCell>
                  <TableCell>
                    <Badge className={getMajorColor(student.major)}>
                      {student.major}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(student.enrollmentDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-muted/50 px-6 py-3 border-t text-xs text-muted-foreground font-mono">
          SELECT * FROM Students ORDER BY student_id;
        </div>
      </Card>
    </div>
  )
}
