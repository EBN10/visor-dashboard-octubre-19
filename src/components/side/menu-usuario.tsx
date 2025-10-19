import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "../ui/dropdown-menu"

function    MenuUsuario() {
    return (
         <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center justify-center gap-3 border-2 border-gray-400/5 p-2 rounded-2xl bg-gray-200/5 hover:bg-gray-200/10 cursor-pointer">
        <Avatar>
          <AvatarImage src="https://avatars.githubusercontent.com/u/123994515?s=400&u=fbf18f535da4dc6308e54f90a5f4eadd26547d44&v=4" className="" />
          <AvatarFallback>EBN</AvatarFallback>
        </Avatar>
        <div>
        <p className="font-bold">BasilOnn</p>
        <p className="text-gray-300 text-sm">basilemir@gmail.com</p>
        </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Opcion 1</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Option 1.1
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Option 1.2
            <DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Option 1.3
            <DropdownMenuShortcut>⇧⌘X</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Opcion 2</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Option 2.1
            <DropdownMenuShortcut>⇧⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Option 2.2
            <DropdownMenuShortcut>⇧⌘A</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Option 2.3
            <DropdownMenuShortcut>⇧⌘O</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Otra</DropdownMenuItem>
      </DropdownMenuContent>
     </DropdownMenu>
    )
}

export default  MenuUsuario