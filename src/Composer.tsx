import Document from "./Document";
import Library, { LibraryDnDContext } from "./Library";

export default function Composer() {
    return (
        <div className='flex'>
            <LibraryDnDContext>
                <Document className='grow-[3]' />
                <Library />
            </LibraryDnDContext>
        </div >
    )
}