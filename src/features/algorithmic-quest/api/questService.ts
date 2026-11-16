import { httpRequest } from '../../../shared/api/httpClient'
import type {
  QuestChallengeMode,
  QuestDTO,
  VerifyQuestRequestDTO,
  VerifyQuestResponseDTO,
} from '../../../shared/types/api.types'

export async function fetchQuestByZone(
  zoneId: string,
  mode: QuestChallengeMode = 'algorithm',
): Promise<QuestDTO> {
  return httpRequest<QuestDTO>(
    `/explorer/quests/${encodeURIComponent(zoneId)}?mode=${encodeURIComponent(mode)}`,
  )
}

export async function verifyQuestSequence(
  zoneId: string,
  submittedOrder: string[],
  mode: QuestChallengeMode = 'algorithm',
): Promise<VerifyQuestResponseDTO> {
  const payload: VerifyQuestRequestDTO = {
    mode,
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
