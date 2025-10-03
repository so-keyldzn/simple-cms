import { DragHandle } from '@tiptap/extension-drag-handle-react'
import { Editor } from '@tiptap/core'
import { GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

function DragHandler({ editor }: { editor: Editor }) {
  return (
		<DragHandle editor={editor}>
			<Button variant="outline" size="sm" type="button" className="drag-handle cursor-grab active:cursor-grabbing">
				<GripVertical className="w-4 h-4" />
			</Button>
		  </DragHandle>
  )
}

export default DragHandler