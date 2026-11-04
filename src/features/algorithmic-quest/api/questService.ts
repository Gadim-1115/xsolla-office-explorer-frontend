import { httpRequest } from '../../../shared/api/httpClient'
import type {
  QuestDTO,
  VerifyQuestRequestDTO,
  VerifyQuestResponseDTO,
} from '../../../shared/types/api.types'

export async function fetchQuestByZone(zoneId: string): Promise<QuestDTO> {
  return httpRequest<QuestDTO>(`/explorer/quests/${encodeURIComponent(zoneId)}`)
}

export async function verifyQuestSequence(
  zoneId: string,
  submittedOrder: string[],
): Promise<VerifyQuestResponseDTO> {
  const payload: VerifyQuestRequestDTO = {
    submitted_order: submittedOrder,
  }
  return httpRequest<VerifyQuestResponseDTO>(
    `/explorer/quests/${encodeURIComponent(zoneId)}/verify`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}
