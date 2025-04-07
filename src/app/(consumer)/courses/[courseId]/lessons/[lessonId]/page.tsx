import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import {
  LessonStatus,
  LessonTable,
  UserLessonCompleteTable,
} from "@/drizzle/schema";
import { YouTubeVideoPlayer } from "@/features/lessons/components/YoutubeVideoPlayer";
import { getLessonIdTag } from "@/features/lessons/db/cache/lessons";
import { getUserLessonCompleteIdTag } from "@/features/lessons/db/cache/userLessonComplete";
import {
  canViewLesson,
  wherePublicLessons,
} from "@/features/lessons/permissions/lessons";
import { getCurrentUser } from "@/services/clerk";
import { and, eq } from "drizzle-orm";
import {
  CheckSquare2,
  CheckSquare2Icon,
  LockIcon,
  XSquareIcon,
} from "lucide-react";
import Link from "next/link";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { ActionButton } from "@/components/ActionButton";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const lesson = await getLesson(lessonId);

  if (!lesson) {
    return notFound();
  }

  // return (
  //   <div className="flex flex-col gap-4">
  //     <h1 className="text-2xl font-bold">{lesson.name}</h1>
  //     <p className="text-gray-300">{lesson.description}</p>
  //     <div className="aspect-video w-full">
  //       <iframe
  //         src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}`}
  //         className="w-full h-full rounded-lg"
  //         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  //         allowFullScreen
  //       />
  //     </div>
  //   </div>
  // );

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SuspenseBoundary lesson={lesson} courseId={courseId} />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return null;
}

async function SuspenseBoundary({
  lesson,
  courseId,
}: {
  lesson: {
    id: string;
    youtubeVideoId: string;
    name: string;
    description: string | null;
    status: LessonStatus;
    sectionId: string;
  };
  courseId: string;
}) {
  const { userId, role } = await getCurrentUser();
  const isLessonComplete =
    userId == null
      ? false
      : await getIsLessonComplete({
          lessonId: lesson.id,
          userId,
        });
  const canView = await canViewLesson({ role, userId }, lesson);
  const canUpdateCompletionStatus = await canUpdateUserLessonCompleteStatus(
    {
      userId,
    },
    lesson.id
  );

  return (
    <div className="my-4 flex flex-col gap-4">
      <div className="aspect-video">
        {canView ? (
          <YouTubeVideoPlayer
            videoId={lesson.youtubeVideoId}
            onFinishedVideo={undefined}
          />
        ) : (
          <div className="flex items-center justify-center bg-primary text-primary-foreground h-full w-full">
            <LockIcon className="size-16" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-2xl font-semibold">{lesson.name}</h1>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" asChild>
              <Link className="text-black font-semibold" href="/">
                이전
              </Link>
            </Button>
            <ActionButton action={null} variant="outline">
              <div className="flex gap-2 items-center text-black font-semibold">
                {isLessonComplete ? (
                  <>
                    <CheckSquare2Icon /> 미완료
                  </>
                ) : (
                  <>
                    <XSquareIcon /> 완료
                  </>
                )}
              </div>
            </ActionButton>
            <Button variant="outline" asChild>
              <Link className="text-black font-semibold" href="/">
                다음
              </Link>
            </Button>
          </div>
        </div>
      </div>
      {canView ? (
        lesson.description && <p>{lesson.description}</p>
      ) : (
        <p>강의를 구매 후 시청 가능합니다.</p>
      )}
    </div>
  );
}

async function getIsLessonComplete({
  userId,
  lessonId,
}: {
  userId: string;
  lessonId: string;
}) {
  "use cache";
  cacheTag(getUserLessonCompleteIdTag({ userId, lessonId }));

  const data = db.query.UserLessonCompleteTable.findFirst({
    where: and(
      eq(UserLessonCompleteTable.userId, userId),
      eq(UserLessonCompleteTable.lessonId, lessonId)
    ),
  });

  return data != null;
}

async function getLesson(id: string) {
  "use cache";
  cacheTag(getLessonIdTag(id));

  return db.query.LessonTable.findFirst({
    columns: {
      id: true,
      youtubeVideoId: true,
      name: true,
      description: true,
      status: true,
      sectionId: true,
    },
    where: and(eq(LessonTable.id, id), wherePublicLessons),
  });
}
