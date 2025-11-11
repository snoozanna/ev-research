import { ColourSelector } from "./ColourSelector"
import { ShareToggle } from "./ShareToggle"
import { FaRegTrashAlt } from "react-icons/fa";
import { useRouter } from "next/router";

const ModifyPost = ({post, colour, setColour}) => {
    const router = useRouter();
    const deletePost = async (id: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this reflection?");
        if (!confirmed) return;
    
        const res = await fetch(`/api/post/${id}`, { method: "DELETE" });
        if (res.ok) {
          router.push("/reflections");
        } else {
          alert("Failed to delete reflection.");
        }
      };
    return(
        <>
  {/* Toggles section (only show delete/share if author) */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t">
          {/* <div className="flex flex-wrap items-center gap-4">
            <ColourSelector postId={post.id} colour={colour} onColourChange={setColour} />
          </div> */}

          {/* Only show share + delete buttons if the current user is the author */}
          {post?.author && (
            <div className="w-full flex justify-between">
              <ShareToggle postId={post.id} initialState={post.shareWithArtist ?? false} />
              <button
                onClick={() => deletePost(post.id)}
                className="flex items-center gap-2 px-4 py-2 rounded bg-(--deletered) text-white focus:outline-none focus:ring focus:ring-red-200"
              >
                <FaRegTrashAlt />
              </button>
            </div>
          )}
        </div>
        </>
    )
}

export default ModifyPost