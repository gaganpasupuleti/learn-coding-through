import { useState } from 'react'
import { SqlWorkbenchLayout } from './SqlWorkbenchLayout'
import { SqlToolbar } from './SqlToolbar'
import { SqlSchemaExplorer } from './SqlSchemaExplorer'
import { SqlEditorPlaceholder, STARTER_SQL } from './SqlEditorPlaceholder'
import { SqlQuestionPanel } from './SqlQuestionPanel'
import { SqlResultGridPlaceholder } from './SqlResultGridPlaceholder'

export function SqlPracticePage() {
  const [dataset, setDataset] = useState('sample-hr')
  const [topic, setTopic] = useState('select')
  const [difficulty, setDifficulty] = useState('easy')
  const [sql, setSql] = useState(STARTER_SQL)

  return (
    <SqlWorkbenchLayout
      toolbar={
        <SqlToolbar
          dataset={dataset}
          topic={topic}
          difficulty={difficulty}
          onDatasetChange={setDataset}
          onTopicChange={setTopic}
          onDifficultyChange={setDifficulty}
        />
      }
      schemaPanel={<SqlSchemaExplorer />}
      editorPanel={<SqlEditorPlaceholder value={sql} onChange={setSql} />}
      questionPanel={<SqlQuestionPanel />}
      bottomPanel={<SqlResultGridPlaceholder />}
    />
  )
}
